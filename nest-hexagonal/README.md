# nest-hexagonal

Backend starter con **arquitectura hexagonal** (ports & adapters): NestJS 12 + Drizzle + PostgreSQL. Implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3002`.

## Capas

```
            infrastructure (adaptadores)
  ┌──────────────────────────────────────────────┐
  │ http/          controllers, DTOs, guard JWT  │──┐ entrada
  │                                              │  │
  │      application   casos de uso, puertos     │◄─┘
  │        ↓             (PasswordHasher, ...)   │
  │      domain        entidades, reglas,        │
  │                    puertos de repositorio    │
  │                                              │
  │ persistence/   repositorios Drizzle          │◄── salida
  │ security/      bcrypt, JWT                   │
  └──────────────────────────────────────────────┘
```

Las dependencias apuntan hacia adentro: `infrastructure → application → domain`. `domain` y `application` son TypeScript puro: no importan Nest, Drizzle ni ninguna librería. ESLint lo hace cumplir (`no-restricted-imports` en `eslint.config.js`).

```
src/
  domain/
    user/             User, Role, Actor; puerto UserRepository
    todo/             Todo, TodoStatus, regla de visibilidad; puerto TodoRepository
    auth/             puerto RefreshTokenRepository
  application/
    errors.ts         NotFoundError, ConflictError, UnauthorizedError
    auth/             Register, Login, RefreshSession, Logout, GetCurrentUser,
                      TokenIssuer; puertos PasswordHasher y AccessTokenSigner
    todos/            ListTodos, GetTodo, CreateTodo, UpdateTodo, DeleteTodo
  infrastructure/
    config/           validación del env al arrancar
    persistence/      schema Drizzle, adaptadores de repositorio, migrador
    security/         adaptadores bcrypt y JWT
    http/
      common/         guard JWT global, @Public(), @CurrentUser(), ValidationPipe,
                      filtro que traduce errores de aplicación al schema `Error`
      auth/, todos/   controllers, DTOs y el módulo Nest que cablea cada caso de uso
    provide-use-case.ts
  app.module.ts, main.ts
drizzle/              migraciones SQL y seed
```

### Cómo se cablea

- Cada puerto es una `abstract class`: sirve de tipo y de token de inyección sin que el dominio importe Nest.
- `PersistenceModule` (global) asocia cada puerto de repositorio con su adaptador: `{ provide: TodoRepository, useClass: DrizzleTodoRepository }`.
- Los casos de uso no tienen decoradores. Cada módulo los registra con `provideUseCase(ListTodos, [TodoRepository])`, que tipa que los tokens coincidan con el constructor.
- Los casos de uso tiran errores de `application/errors.ts`; `AllExceptionsFilter` los mapea a `404`/`409`/`401`.

Cambiar Drizzle por otro ORM es reescribir `infrastructure/persistence/` sin tocar `domain` ni `application`.

## Correr

```bash
pnpm install
cp .env.example .env
docker compose up -d db      # Postgres en localhost:5402
pnpm migrate                 # aplica las migraciones
pnpm seed                    # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                     # http://localhost:3002, Swagger en /docs
```

Todo en Docker (API + DB, aplica las migraciones al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3002` en `front-vite-fsd/.env`.

| Script                    | Qué hace                                                       |
| ------------------------- | -------------------------------------------------------------- |
| `dev` / `build` / `start` | Nest en watch / compila a `dist` / corre `dist`                |
| `lint` / `typecheck`      | ESLint (type-aware, con límites de capas) / `tsc --noEmit`     |
| `format`                  | Prettier                                                       |
| `migrate:generate`        | `drizzle-kit generate`: crea una migración desde el schema     |
| `migrate`                 | `drizzle-kit migrate`: aplica migraciones pendientes           |
| `migrate:deploy`          | aplica migraciones con el migrador compilado (sin drizzle-kit) |
| `seed`                    | `tsx drizzle/seed.ts`                                          |

Las columnas se escriben en camelCase en el schema y quedan en snake_case en la DB (`casing: 'snake_case'` en `drizzle.config.ts` y en `DrizzleService`).

## Auth

- Password con bcrypt (por eso el máximo de 72 caracteres del contrato).
- Access token: JWT firmado con `JWT_ACCESS_SECRET`, vida `ACCESS_TOKEN_TTL` segundos.
- Refresh token: string aleatorio opaco; en la DB solo se guarda su hash SHA-256 (es la PK). Cada refresh lo consume con un único `DELETE … RETURNING` y emite un par nuevo; reusar uno viejo da `401`. Vida `REFRESH_TOKEN_TTL` segundos.
- Todas las rutas requieren `Bearer` salvo las marcadas con `@Public()`.

## Reemplazar `Todo` por otro dominio

1. `src/domain/<entidad>/`: tipos de la entidad, sus reglas y el puerto `<Entidad>Repository`.
2. `src/application/<entidades>/`: un caso de uso por operación.
3. `src/infrastructure/persistence/`: tabla en `schema.ts` y adaptador `drizzle-<entidad>.repository.ts`; registralo en `PersistenceModule`. Corré `pnpm migrate:generate --name <nombre>` y `pnpm migrate` (borrá `drizzle/migrations` si arrancás de cero).
4. `src/infrastructure/http/<entidades>/`: DTOs, controller y módulo con `provideUseCase`; registralo en `app.module.ts`.
5. Borrá todo lo de `todo`/`todos` en las tres capas y actualizá `drizzle/seed.ts` y el contrato.

`auth`, `user`, `config`, `security` y `http/common` no cambian.

## No incluido

Pensado para agregar cuando haga falta: `RolesGuard` (hoy ningún endpoint es exclusivo de `ADMIN`), rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests (los casos de uso se prueban con fakes de los puertos, sin Nest ni DB).
