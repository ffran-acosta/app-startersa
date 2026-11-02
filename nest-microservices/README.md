# nest-microservices

Backend starter con **microservicios**: NestJS 12 + NATS + Prisma 7 + PostgreSQL. Un gateway HTTP implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3005` y delega en dos servicios por NATS.

## Servicios

```
                   ┌─────────┐   request-response   ┌──────────┐
  HTTP :3005 ────► │ gateway │ ──── auth.* ───────► │   auth   │ ──► DB auth
                   │         │                      └──────────┘     users, refresh_tokens
                   │ valida, │        NATS          ┌──────────┐
                   │ JWT     │ ──── todos.* ──────► │  todos   │ ──► DB todos
                   └─────────┘                      └──────────┘     todos
```

- **gateway**: la única app con HTTP. Valida DTOs, verifica el access token (con el mismo `JWT_ACCESS_SECRET`, sin consultar a auth), arma la respuesta y traduce los errores de los servicios al schema `Error` del contrato. No tiene DB.
- **auth**: usuarios, contraseñas y refresh tokens. Es el único que firma tokens.
- **todos**: CRUD de todos. Recibe el `AuthUser` que le manda el gateway y aplica el alcance (`USER` lo suyo, `ADMIN` todo).

Cada servicio es un proceso aparte con **su propia DB** (`auth` y `todos`, en el mismo Postgres del `docker-compose`). No hay FK entre DBs: `todos.ownerId` es el id del usuario en auth. Los servicios se suscriben con un `queue` de NATS, así que levantar más réplicas reparte la carga sin configurar nada.

### Mensajes

`libs/contracts` define cada mensaje como patrón → payload y resultado (`Messages`). El gateway envía con `ServicesClient.send('todos.get', { user, id })` y el tipo del payload y del resultado salen de ahí; cada servicio implementa el mismo patrón con `@MessagePattern('todos.get' satisfies Pattern)`.

- Las fechas viajan como strings ISO (JSON): `Json<T>` es el tipo de lo que llega al gateway.
- Errores esperados: el servicio lanza `rpcError(HttpStatus.NOT_FOUND, 'Todo not found')` y el gateway responde con ese status.
- Si nadie escucha el patrón o el servicio no contesta en 5 s, el gateway responde `503`.
- Los handlers sin respuesta devuelven `null` (con `undefined` el gateway recibiría un observable vacío).
- Los servicios confían en los payloads: el gateway ya validó. NATS no se expone fuera de la red interna.

```
apps/
  gateway/src/
    auth/            controller, guard JWT global, @CurrentUser, @Public, dto/
    todos/           controller, dto/
    http/            ValidationPipe y filtro que responde con el schema `Error`
    services.client.ts   send() tipado por NATS, timeout y traducción de errores
    env.ts, app.module.ts, main.ts
  auth/
    prisma/          schema.prisma y migraciones de la DB auth
    src/             auth.controller (handlers NATS), auth.service, repositorios
  todos/
    prisma/          schema.prisma y migraciones de la DB todos
    src/             todos.controller (handlers NATS), todos.service, todos.repository
libs/
  contracts/         mensajes, payloads, resultados, Role, TodoStatus, rpcError
  config/            validación del env al arrancar
scripts/seed.ts      escribe en las dos DBs
docker/              crea las DBs auth y todos en el Postgres del compose
```

Es un monorepo de Nest (`nest-cli.json` con tres `projects`) con un solo `package.json`. Cada app compila a `dist/<app>` y se despliega por separado; en Docker es la misma imagen con distinto `command`.

Reglas que hace cumplir ESLint (`eslint.config.js`):

- Una app no importa código de otra; solo `libs/`.
- `libs/` no importa nada de `apps/`.

## Correr

```bash
pnpm install                 # también genera los dos clientes Prisma
cp .env.example .env
docker compose up -d db nats # Postgres en localhost:5405, NATS en 4222
pnpm migrate                 # aplica las migraciones de auth y de todos
pnpm seed                    # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                     # las tres apps; http://localhost:3005, Swagger en /docs
```

Todo en Docker (DB, NATS y las tres apps; auth y todos aplican sus migraciones al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3005` en `front-vite-fsd/.env`.

| Script                           | Qué hace                                                         |
| -------------------------------- | ---------------------------------------------------------------- |
| `dev`                            | las tres apps en watch (`nest start <app> --watch`)              |
| `build`                          | compila cada app a `dist/<app>`                                  |
| `lint` / `typecheck`             | ESLint (type-aware, con límites entre apps) / `tsc --noEmit`     |
| `format`                         | Prettier                                                         |
| `migrate`                        | `prisma migrate dev` de auth y de todos                          |
| `migrate:auth` / `migrate:todos` | lo mismo para un servicio (`pnpm migrate:todos --name <nombre>`) |
| `seed`                           | `tsx scripts/seed.ts`                                            |

Nunca `db push` ni sincronización automática: el schema cambia solo por migraciones versionadas.

## Auth

- Password con bcrypt (por eso el máximo de 72 caracteres del contrato), en auth.
- Access token: JWT firmado por auth con `JWT_ACCESS_SECRET`, vida `ACCESS_TOKEN_TTL` segundos. El gateway lo verifica localmente, sin un mensaje por request.
- Refresh token: string aleatorio opaco; en la DB solo se guarda su hash SHA-256. Cada refresh lo consume y emite un par nuevo; reusar uno viejo da `401`. Vida `REFRESH_TOKEN_TTL` segundos.
- Todas las rutas del gateway requieren `Bearer` salvo las marcadas con `@Public()`.

## Reemplazar `Todo` por otro dominio

1. Copiá `apps/todos/` como `apps/<servicio>/` (con su `prisma.config.ts`, apuntando a `<SERVICIO>_DATABASE_URL`) y sumalo a `projects` en `nest-cli.json`, a `apps` en `eslint.config.js` y a los scripts `postinstall`, `dev`, `build` y `migrate` de `package.json`.
2. Definí sus mensajes en `libs/contracts/<servicio>.ts` y sumalos a `Messages` en `libs/contracts/messages.ts`.
3. En el gateway, creá `src/<servicio>/` con controller y DTOs (que implementen los payloads de `libs/contracts`) y registralo en `app.module.ts`.
4. Sumá la DB a `docker/init-databases.sql` (con el volumen vacío: `docker compose down -v`), la URL a `.env.example` y el servicio a `docker-compose.yml`.
5. Borrá `apps/todos/`, `libs/contracts/todos.ts` y `apps/gateway/src/todos/`, sacalos de todos los lugares de arriba y actualizá `scripts/seed.ts` y el contrato.
6. `pnpm migrate:<servicio> --name init`.

auth, `libs/config` y la infraestructura del gateway (`auth/`, `http/`, `services.client.ts`) no cambian.

## No incluido

Pensado para agregar cuando haga falta: eventos entre servicios (`emit` + `@EventPattern`, p. ej. auth avisa `user.deleted` y todos limpia; para que sea confiable hace falta un outbox, ver `nest-event-driven`), JetStream para mensajes persistentes, health checks, tracing distribuido, `RolesGuard`, rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests (cada servicio se prueba solo enviándole mensajes; el gateway con un `ServicesClient` falso).
