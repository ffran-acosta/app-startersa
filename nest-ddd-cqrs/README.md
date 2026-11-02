# nest-ddd-cqrs

Backend starter con **DDD + CQRS**: NestJS 12 + `@nestjs/cqrs` + TypeORM + PostgreSQL. Implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3003`.

## Capas

```
 HTTP ─► controller ──► CommandBus ──► CommandHandler ──► Repository ──► aggregate ──► DB
            │                              │  (escritura)                  │
            │                              └── EventBus ◄── eventos de dominio
            │                                     │
            │                                     └──► EventsHandler (efectos secundarios)
            │
            └─────────► QueryBus ───► QueryHandler ──► ReadModel ──► DB
                                       (lectura: vistas planas, sin aggregate)
```

- **Escritura**: un comando carga el aggregate por su repositorio, le pide el cambio (el aggregate valida sus invariantes y registra eventos), lo guarda y publica los eventos. Los comandos no devuelven el recurso: a lo sumo un `id`.
- **Lectura**: las queries van directo a un `ReadModel` que devuelve vistas planas (`TodoView`, `UserView`) con `select` explícito, sin reconstruir aggregates.
- El controller encadena ambos lados: `POST /todos` ejecuta `CreateTodoCommand` (devuelve el `id`) y responde con `GetTodoQuery`.

Cada **bounded context** es un módulo con sus tres capas. Los contextos no se importan entre sí; solo comparten `shared/` (el `Actor`, la base de aggregates, errores, HTTP común). `todos.owner_id` referencia a `identity` por id, sin FK.

```
src/
  shared/
    domain/           Actor + Role, AggregateRoot, DomainError
    application/      NotFoundError, ConflictError, UnauthorizedError
    infrastructure/   env, guard JWT global, @Public(), @CurrentUser(), ValidationPipe,
                      filtro que traduce errores al schema `Error`
  identity/           usuarios, credenciales y sesiones
    domain/           aggregate User, value object Email, puertos de repositorio
    application/      commands: RegisterUser, Login, RefreshSession, Logout
                      queries: GetUser (+ UserReadModel); puertos PasswordHasher y
                      AccessTokenSigner; TokenIssuer
    infrastructure/   entidades y repos TypeORM, bcrypt, JWT, AuthController
    identity.module.ts
  todos/
    domain/           aggregate Todo, value object TodoTitle, eventos TodoCreated /
                      TodoCompleted / TodoDeleted, puerto TodoRepository
    application/      commands: CreateTodo, UpdateTodo, DeleteTodo
                      queries: ListTodos, GetTodo (+ TodoReadModel)
                      events: LogTodoActivityHandler
    infrastructure/   entidad, repo y read model TypeORM, TodosController
    todos.module.ts
  database/           opciones TypeORM, DataSource de la CLI, migraciones, migrador, seed
  app.module.ts, main.ts
```

Reglas que hace cumplir ESLint (`eslint.config.js`):

- `domain/` es TypeScript puro: no importa Nest, TypeORM ni ninguna librería, ni a `application`/`infrastructure`.
- `application/` solo usa `@nestjs/cqrs` (y `@nestjs/common`); no el ORM ni librerías de infraestructura.
- `identity/`, `todos/` y `shared/` no se importan entre sí (salvo todos → `shared`).

### Cómo se cablea

- Commands y queries extienden `Command<T>` / `Query<T>` de `@nestjs/cqrs`, así `commandBus.execute(...)` queda tipado. Cada archivo tiene el mensaje y su handler.
- Repositorios y read models son `abstract class` (tipo + token de DI); cada módulo los asocia con su implementación TypeORM: `{ provide: TodoRepository, useClass: TypeormTodoRepository }`.
- Los aggregates heredan de un `AggregateRoot` propio (no el de `@nestjs/cqrs`) para que el dominio no dependa de Nest. El handler publica con `eventBus.publishAll(todo.pullEvents())` después de guardar.
- Las entidades TypeORM (`*.entity.ts`) son el modelo de persistencia, separado del aggregate; los repos mapean entre ambos (`Todo.restore(...)` / `todo.toPrimitives()`).
- Errores: `DomainError` → `400`, `NotFoundError` → `404`, `ConflictError` → `409`, `UnauthorizedError` → `401` (`AllExceptionsFilter`).

`LogTodoActivityHandler` solo loguea: es el lugar para reaccionar a eventos (notificar, auditar, actualizar otro contexto) sin tocar los comandos. Los eventos se publican en memoria y después del commit; si la reacción tiene que ser confiable hace falta un outbox (ver `nest-event-driven`).

## Correr

```bash
pnpm install
cp .env.example .env
docker compose up -d db      # Postgres en localhost:5403
pnpm migrate                 # aplica las migraciones
pnpm seed                    # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                     # http://localhost:3003, Swagger en /docs
```

Todo en Docker (API + DB, aplica las migraciones al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3003` en `front-vite-fsd/.env`.

| Script                    | Qué hace                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `dev` / `build` / `start` | Nest en watch / compila a `dist` / corre `dist`                                        |
| `lint` / `typecheck`      | ESLint (type-aware, con límites de capas y contextos) / `tsc --noEmit`                 |
| `format`                  | Prettier                                                                               |
| `typeorm`                 | CLI de TypeORM con `src/database/data-source.ts` (vía `tsx`)                           |
| `migrate:generate <path>` | crea una migración comparando entidades y DB, p. ej. `src/database/migrations/AddTags` |
| `migrate`                 | aplica migraciones pendientes                                                          |
| `migrate:deploy`          | aplica migraciones con el migrador compilado (`dist/database/migrate.js`)              |
| `seed`                    | `tsx src/database/seed.ts`                                                             |

Nunca `synchronize`: el schema cambia solo por migraciones versionadas. Las columnas se nombran en snake_case explícitamente en cada `@Column({ name })`.

## Auth

- Password con bcrypt (por eso el máximo de 72 caracteres del contrato).
- Access token: JWT firmado con `JWT_ACCESS_SECRET`, vida `ACCESS_TOKEN_TTL` segundos.
- Refresh token: string aleatorio opaco; en la DB solo se guarda su hash SHA-256 (es la PK). Cada refresh lo consume con un único `DELETE … RETURNING` y emite un par nuevo; reusar uno viejo da `401`. Vida `REFRESH_TOKEN_TTL` segundos.
- Todas las rutas requieren `Bearer` salvo las marcadas con `@Public()`.

## Reemplazar `Todo` por otro dominio

1. Copiá `src/todos/` como `src/<contexto>/` y registrá su módulo en `app.module.ts`.
2. `domain/`: el aggregate con sus reglas y eventos, sus value objects y el puerto `<Entidad>Repository`.
3. `application/`: un archivo por comando y por query (mensaje + handler), el `<Entidad>ReadModel` con sus vistas y los handlers de eventos que hagan falta.
4. `infrastructure/`: entidad TypeORM (sumala a `src/database/options.ts`), repo, read model, DTOs y controller.
5. Borrá `src/todos/`, sacá `TodoEntity` de `options.ts`, actualizá `src/database/seed.ts` y el contrato.
6. Generá la migración: `pnpm migrate:generate src/database/migrations/<Nombre>` y `pnpm migrate` (borrá las migraciones viejas si arrancás de cero).

`identity` y `shared` no cambian.

## No incluido

Pensado para agregar cuando haga falta: `RolesGuard` (hoy ningún endpoint es exclusivo de `ADMIN`), outbox para eventos confiables, transacciones que abarquen varios aggregates (unit of work), rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests (los handlers se prueban con fakes de los repositorios, sin Nest ni DB).
