# nest-modular-monolith

Backend starter con **monolito modular**: NestJS 12 + Prisma 7 + PostgreSQL. Implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3004`.

## Módulos

```
            ┌──────────────── un proceso, una DB ────────────────┐
            │                                                    │
  HTTP ───► │  auth ──── UsersApi ────► users                    │
            │   │  guard JWT global,       │  usuarios y         │
            │   │  @CurrentUser, Role      │  credenciales       │
            │   ▼                          │                     │
            │  todos                       │                     │
            │   │                          │                     │
            │   ▼                          ▼                     │
            │  schema "todos"   schema "auth"   schema "users"   │
            └────────────────────────────────────────────────────┘
```

Cada módulo es una unidad que podría extraerse a un servicio (ver `nest-microservices`):

- **API pública explícita**: lo que exporta su `index.ts`. El resto del módulo es privado.
- **Datos propios**: un schema de Postgres por módulo (`users`, `auth`, `todos`). Entre schemas no hay FK; los módulos se referencian solo por id (`auth.refresh_tokens.userId`, `todos.todos.ownerId`).
- **Comunicación por interfaces in-process**: un módulo llama a otro a través de su API pública, nunca a sus repositorios ni a sus tablas.

Dentro de cada módulo la estructura es la de `nest-layered` (controller → service → repository, DTOs validados).

```
src/
  shared/              infraestructura sin dominio
    config/            validación del env al arrancar
    database/          PrismaService global
    http/              ValidationPipe y filtro que responde con el schema `Error`
  modules/
    users/             dueño de users.users
      index.ts         UsersModule, UsersApi, UserView, Role
      users.api.ts     register, verifyCredentials, findById (el hash nunca sale del módulo)
      users.repository.ts
    auth/              dueño de auth.refresh_tokens
      index.ts         AuthModule, @CurrentUser(), AuthUser, @Public(), Role
      auth.controller.ts, auth.service.ts, refresh-tokens.repository.ts, dto/
      jwt-auth.guard.ts  registrado como APP_GUARD desde AuthModule
    todos/             dueño de todos.todos
      index.ts         TodosModule
      todos.controller.ts, todos.service.ts, todos.repository.ts, dto/
  generated/prisma/    cliente generado (no se versiona)
  app.module.ts, main.ts
prisma/
  schema/              un .prisma por módulo + schema.prisma (generator y datasource)
  migrations/, seed.ts
```

Dependencias entre módulos: `auth → users`, `todos → auth`. `shared/` no conoce a ningún módulo.

Reglas que hace cumplir ESLint (`eslint.config.js`):

- Desde otro módulo solo se importa su `index.js` (`../users/users.repository.js` desde `auth` es error).
- Un módulo no accede a los modelos Prisma de otro: `prisma.user` dentro de `todos` es error.
- `shared/` no importa nada de `modules/`.

### Por qué no hay eventos

La otra forma de comunicar módulos es con eventos in-process (`@nestjs/event-emitter`): el módulo que cambia algo publica un evento y los interesados reaccionan sin que el emisor los conozca. Acá no hay un caso real: el contrato no tiene borrado de usuarios, que sería el ejemplo típico (`users` emite `UserDeleted` y `auth`/`todos` limpian sus filas, porque sin FK no hay cascada). Se agrega cuando aparezca esa necesidad. Si la reacción tiene que ser confiable hace falta un outbox (ver `nest-event-driven`).

## Correr

```bash
pnpm install                 # también genera el cliente Prisma
cp .env.example .env
docker compose up -d db      # Postgres en localhost:5404
pnpm migrate                 # aplica las migraciones
pnpm seed                    # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                     # http://localhost:3004, Swagger en /docs
```

Todo en Docker (API + DB, aplica las migraciones al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3004` en `front-vite-fsd/.env`.

| Script                    | Qué hace                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `dev` / `build` / `start` | Nest en watch / compila a `dist` / corre `dist`                 |
| `lint` / `typecheck`      | ESLint (type-aware, con límites entre módulos) / `tsc --noEmit` |
| `format`                  | Prettier                                                        |
| `migrate`                 | `prisma migrate dev`: crea y aplica migraciones                 |
| `migrate:deploy`          | aplica migraciones pendientes (lo que corre Docker)             |
| `seed`                    | `tsx prisma/seed.ts`                                            |

Nunca `db push` ni sincronización automática: el schema cambia solo por migraciones versionadas.

## Auth

- Password con bcrypt (por eso el máximo de 72 caracteres del contrato), dentro de `users`.
- Access token: JWT firmado con `JWT_ACCESS_SECRET`, vida `ACCESS_TOKEN_TTL` segundos.
- Refresh token: string aleatorio opaco; en la DB solo se guarda su hash SHA-256. Cada refresh lo consume y emite un par nuevo; reusar uno viejo da `401`. Como no hay join con `users`, el refresh vuelve a pedir el usuario a `UsersApi` (y da `401` si ya no existe). Vida `REFRESH_TOKEN_TTL` segundos.
- Todas las rutas requieren `Bearer` salvo las marcadas con `@Public()` (exportado por `auth`).

## Reemplazar `Todo` por otro dominio

1. Copiá `src/modules/todos/` como `src/modules/<modulo>/` y registrá su módulo en `app.module.ts`.
2. Creá `prisma/schema/<modulo>.prisma` con sus modelos bajo `@@schema("<modulo>")` y sumá el schema a `schemas` en `prisma/schema/schema.prisma`. Las referencias a otros módulos son solo columnas de id, sin `@relation`.
3. Sumá el módulo y su modelo a `models` en `eslint.config.js` para que rijan los límites.
4. Si otro módulo necesita algo de este, exponelo en su `index.ts` (un `<Modulo>Api` como `UsersApi`); nunca el repositorio.
5. Borrá `src/modules/todos/` y `prisma/schema/todos.prisma`, sacá `todos` de `schemas` y de `eslint.config.js`, y actualizá `prisma/seed.ts` y el contrato.
6. `pnpm migrate --name <nombre>` (borrá las migraciones viejas si arrancás de cero).

`users`, `auth` y `shared` no cambian.

## No incluido

Pensado para agregar cuando haga falta: eventos in-process entre módulos (ver arriba), `RolesGuard` (hoy ningún endpoint es exclusivo de `ADMIN`), transacciones que abarquen varios módulos, rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests (cada módulo se prueba solo, con fakes de las APIs públicas de los otros).
