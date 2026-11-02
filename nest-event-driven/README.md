# nest-event-driven

Backend starter **event-driven**: NestJS 12 + Prisma 7 + PostgreSQL + Redis Streams. Implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3006`.

Es un monolito en capas (como `nest-layered`) que, además, publica un evento por cada cambio de un todo con el **patrón outbox** y lo procesa con un **consumidor idempotente**. El consumidor de ejemplo arma un historial (`todo_activity`); el contrato HTTP no cambia.

## Flujo de un evento

```
POST/PATCH/DELETE /todos
  ↓
TodosRepository   una transacción: escribe el todo + una fila en outbox_events
  ↓                (si la transacción falla no hay evento; si Redis está caído no se pierde)
OutboxRelay       cada 1 s toma lo no publicado (FOR UPDATE SKIP LOCKED), XADD al stream
  ↓                `events` y marca publishedAt
Redis Stream      `events`, un consumer group por consumidor
  ↓
StreamConsumer    XREADGROUP (con CLAIM: retoma lo que quedó sin ACK de otra instancia)
  ↓                una transacción: inserta (eventId, consumer) en processed_events y aplica
  ↓                el efecto; si ya estaba, lo saltea. Después XACK
ActivityConsumer  inserta en todo_activity
```

La entrega es **at-least-once**: un evento puede llegar repetido (el relay se cae entre XADD y la marca, un consumidor se cae antes del ACK), y `processed_events` hace que el efecto se aplique una sola vez. Si un handler falla, el mensaje queda sin ACK y se reintenta a los 60 s; después de 5 entregas se descarta con un log de error.

Funciona con varias instancias de la API: el relay reparte lotes con `SKIP LOCKED` y el consumer group reparte mensajes entre instancias. El orden entre eventos se respeta con una sola instancia; con varias puede variar.

## Capas

```
src/
  main.ts           CORS, Swagger (/docs)
  app.module.ts     guard JWT, ValidationPipe y filtro de errores globales
  config/           validación del env al arrancar
  database/         PrismaService (adapter pg)
  events/           infraestructura de eventos, sin dominio
    domain-event.ts               DomainEvent y su (de)serialización al stream
    redis.service.ts              cliente Redis compartido
    outbox.repository.ts          add(tx, type, payload) y lectura de pendientes
    outbox-relay.ts               outbox → Redis
    processed-events.repository.ts  runOnce(): idempotencia
    stream-consumer.ts            clase base de los consumidores
  common/           guard JWT, @Public(), @CurrentUser(), pipes y filtro de errores
  modules/
    auth/           register, login, refresh (con rotación), logout, me
    users/          repositorio de usuarios (lo usa auth)
    todos/          controller → service → repository; todo-events.ts define los eventos
    activity/       ActivityConsumer → ActivityRepository (todo_activity)
prisma/             schema, migraciones, seed
```

El relay y los consumidores arrancan en `onApplicationBootstrap` y frenan en `onModuleDestroy`; Prisma y Redis se desconectan en `onApplicationShutdown`, después de que ellos terminen.

## Correr

```bash
pnpm install
cp .env.example .env
docker compose up -d db redis   # Postgres en localhost:5406, Redis en localhost:6379
pnpm migrate                    # aplica/crea migraciones
pnpm seed                       # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                        # http://localhost:3006, Swagger en /docs
```

Todo en Docker (API + DB + Redis, corre `prisma migrate deploy` al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3006` en `front-vite-fsd/.env`.

Para ver los eventos:

```bash
docker compose exec db psql -U postgres -d nest_event_driven -c 'select * from todo_activity'
docker compose exec redis redis-cli XINFO GROUPS events   # pending, lag
docker compose exec redis redis-cli XRANGE events - +
```

El seed escribe directo en la DB, así que no genera eventos.

| Script                    | Qué hace                                         |
| ------------------------- | ------------------------------------------------ |
| `dev` / `build` / `start` | Nest en watch / compila a `dist` / corre `dist`  |
| `lint` / `typecheck`      | ESLint (type-aware) / `tsc --noEmit`             |
| `format`                  | Prettier                                         |
| `migrate`                 | `prisma migrate dev` (crea y aplica migraciones) |
| `migrate:deploy`          | `prisma migrate deploy` (producción)             |
| `seed`                    | `prisma db seed`                                 |

`pnpm install` corre `prisma generate`; el cliente queda en `src/generated/prisma` (no se versiona).

## Auth

- Password con bcrypt (por eso el máximo de 72 caracteres del contrato).
- Access token: JWT firmado con `JWT_ACCESS_SECRET`, vida `ACCESS_TOKEN_TTL` segundos.
- Refresh token: string aleatorio opaco; en la DB solo se guarda su hash SHA-256. Cada refresh lo consume y emite un par nuevo; reusar uno viejo da `401`. Vida `REFRESH_TOKEN_TTL` segundos.
- Todas las rutas requieren `Bearer` salvo las marcadas con `@Public()`.

## Reemplazar `Todo` por otro dominio

1. `prisma/schema.prisma`: reemplazá el modelo `Todo` (y su enum) y `TodoActivity` por los tuyos, y corré `pnpm migrate --name <nombre>`. Borrá la migración inicial si arrancás de cero. `OutboxEvent` y `ProcessedEvent` quedan.
2. Copiá `src/modules/todos` a `src/modules/<entidad>` y adaptá:
   - `<entidad>-events.ts`: tipos de evento y payload.
   - `*.repository.ts`: el `select`, los tipos de Prisma y qué evento escribe cada operación (siempre con `this.outbox.add(tx, ...)` dentro de la transacción).
   - `dto/`, `*.service.ts` y `*.controller.ts`: validaciones, reglas de negocio (`scope()` define qué ve cada rol) y rutas.
3. Por cada reacción a eventos, un módulo con una clase que extienda `StreamConsumer`: un `group` único y `handle(event, tx)`, que escribe solo con `tx` para que el efecto y la marca de procesado sean atómicos. Borrá `activity` si no lo usás.
4. Registrá los módulos nuevos en `app.module.ts` y borrá `todos`.
5. Actualizá `prisma/seed.ts` y el contrato.

`auth`, `users`, `common`, `config`, `database` y `events` no cambian.

## No incluido

Pensado para agregar cuando haga falta: limpieza periódica de `outbox_events` publicados y de `processed_events` viejos, dead-letter stream (hoy un evento que falla 5 veces solo se loguea), efectos fuera de la DB en un consumidor (un mail, una API externa: ahí la idempotencia depende de ese sistema), versionado del payload de los eventos, `RolesGuard`, rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests.
