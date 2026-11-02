# app-startersa

Starters para arrancar apps personales. Cada backend implementa una arquitectura distinta con el mismo dominio mínimo (`Todo` + auth), y los dos fronts funcionan contra cualquiera de ellos. El dominio `Todo` es descartable: se reemplaza por el de la app nueva sin tocar la estructura.

## Estructura

```
contract/                 OpenAPI único que todos los backends respetan
front-vite-fsd/           :5173  Vite + React + TS, Feature-Sliced Design
front-next-app-router/    :3000  Next.js App Router, feature-based
nest-layered/             :3001  Prisma
nest-hexagonal/           :3002  Drizzle
nest-ddd-cqrs/            :3003  TypeORM
nest-modular-monolith/    :3004  Prisma
nest-microservices/       :3005  Prisma (gateway + servicios por NATS)
nest-event-driven/        :3006  Prisma + Redis Streams
```

Cada carpeta es autónoma (su propio `package.json`, lockfile y `docker-compose.yml`), sin workspaces ni dependencias compartidas, para poder extraerla sola:

```bash
npx degit ffran-acosta/app-startersa/nest-layered mi-app
```

`contract/` es la única referencia cruzada y solo se usa para validar y generar tipos, no para correr. El README de cada carpeta explica su arquitectura, cómo correrla y cómo reemplazar `Todo`.

El `package.json` de la raíz solo tiene atajos para trabajar en este repo (`pnpm front`, `pnpm next`, `pnpm <backend>`, `pnpm <backend>:docker`); no viaja con `degit`.

## Contrato

Auth:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- Roles `USER` y `ADMIN`. JWT de acceso + refresh token opaco con rotación; logout idempotente (`204` siempre).

Todo (`id`, `title`, `description?`, `status: PENDING | DONE`, `dueDate?`, `ownerId`, timestamps):
- `GET /todos?page&limit&status&search`, `POST /todos`
- `GET /todos/:id`, `PATCH /todos/:id`, `DELETE /todos/:id`
- `USER` ve solo lo suyo (`404`, no `403`, para todos ajenos); `ADMIN` ve todo.

Recursos sueltos sin envoltorio, listados como `{ data, meta }` y un schema `Error` único. Como el formato es idéntico en todos, el front cambia de backend con solo cambiar `VITE_API_URL` (Vite) o `API_URL` (Next).

## Arquitecturas

| Carpeta | Arquitectura | ORM |
|---|---|---|
| `nest-layered` | Capas: `modules/<feature>/{controller,service,repository,dto}` + `common/`, `config/`, `database/` | Prisma |
| `nest-hexagonal` | Ports & adapters: `domain/`, `application/`, `infrastructure/`; el dominio no importa Nest ni el ORM | Drizzle |
| `nest-ddd-cqrs` | Aggregates, value objects, commands/queries con handlers, domain events; un bounded context por módulo | TypeORM |
| `nest-modular-monolith` | Módulos con API pública explícita y schema Postgres propio, sin acceso cruzado a tablas | Prisma |
| `nest-microservices` | Gateway HTTP + servicios `auth` y `todos` sobre NATS, una DB por servicio | Prisma |
| `nest-event-driven` | Monolito con outbox, publicación en Redis Streams y consumidores idempotentes | Prisma |

El ORM mixto es a propósito: Drizzle en `nest-hexagonal` muestra que el adaptador de persistencia se cambia sin tocar dominio ni casos de uso, y TypeORM encaja con aggregates y `@nestjs/cqrs`. En el resto prima Prisma por velocidad de arranque.

Fronts:
- **front-vite-fsd**: SPA con TanStack Query y React Router; `steiger` hace cumplir los límites de capas FSD.
- **front-next-app-router**: RSC + Server Actions, tokens en cookies httpOnly; el navegador nunca habla con la API (`API_URL` es solo del servidor).

Los dos usan tipos generados desde `contract/` con `openapi-fetch` (`pnpm gen:api`) y pueden correr contra un mock del contrato (`pnpm mock`).

## Uso al iniciar un proyecto

- **Bases reales:** `nest-layered` (o `nest-modular-monolith` si la app va a tener varios dominios) más un front: `front-vite-fsd` para una SPA detrás de login, `front-next-app-router` si hace falta SEO o render en el servidor.
- **Referencia:** `nest-hexagonal`, `nest-ddd-cqrs`, `nest-microservices` y `nest-event-driven` sirven para aprender y consultar patrones. Solo se usan como base si el proyecto realmente lo pide; que estén acá no es motivo para elegirlas.
- **Al clonar:** primero `pnpm up --latest` y arreglar lo que rompa. Después borrar lo que el proyecto no necesite (roles, refresh, etc.) en vez de arrastrarlo, y reemplazar `Todo` según el README de la carpeta.
- **Mantenimiento:** una mejora descubierta en un proyecto real (un fix de auth, una config) vuelve al starter correspondiente. Si un starter pasa mucho tiempo sin tocarse, conviene actualizarlo antes de usarlo.

## Convenciones

- Node 22, pnpm, TypeScript estricto, ESLint + Prettier (sin `;`).
- Controller → Service → Repository (o su equivalente en cada arquitectura), DTOs validados, sin `console.log`.
- `select` explícito, paginación, sin N+1, migraciones versionadas, nunca `synchronize` en prod.
- `.env.example` con todas las variables; `.env` fuera del repo.
- `docker-compose.yml` con Postgres (en el host en `5400 + n`: `nest-layered` → 5401) y broker donde aplique.
- Swagger en `/docs`, con las mismas rutas que `contract/`.

Versiones fijadas a propósito:
- TypeScript 5.9 en los fronts y 6.0 en los backends, nunca 7: TS 7 no expone la API de JS que usan `openapi-typescript`, `steiger` y `typescript-eslint`.
- ESLint en vez de `oxlint` (que traen las plantillas de Vite 8 y Nest 12).
- Prisma 7 y Drizzle 0.45 estables, no las RC que npm marca como `latest`.

## Al agregar o cambiar un starter

- `docker compose up` levanta DB y API; las migraciones corren limpias.
- Auth y CRUD cumplen `contract/` y los dos fronts funcionan apuntando a ese backend.
- Lint y typecheck sin errores.
- README con diagrama y guía para reemplazar el dominio.
- Sin dependencias ni código que no se use.
- Un backend nuevo suma sus dos atajos al `package.json` de la raíz.
