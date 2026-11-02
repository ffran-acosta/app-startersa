# Plan: repos starter por arquitectura

Estado: **etapas 1 (contrato), 2 (front-vite-fsd) y 3 (nest-layered) hechas. Etapa 4 en curso: `nest-hexagonal` hecho, falta `nest-ddd-cqrs`.**

Repo: https://github.com/ffran-acosta/app-startersa

## Objetivo
Tener repos base listos para clonar y arrancar apps personales. Cada backend implementa una arquitectura distinta con el mismo dominio mínimo (`Todo` + auth), y un único front los consume a todos. El dominio `Todo` es descartable: se reemplaza por el de la app nueva sin tocar la estructura.

## Estructura

```
Codigo/arquitecturas/
  PLAN.md
  contract/                 OpenAPI único que todos los backends respetan
  front-vite-fsd/           Vite + React + TS, Feature-Sliced Design
  front-next-app-router/    Next.js App Router, feature-based (por si un proyecto lo necesita)
  nest-layered/             :3001  Prisma
  nest-hexagonal/           :3002  Drizzle
  nest-ddd-cqrs/            :3003  TypeORM
  nest-modular-monolith/    :3004  Prisma
  nest-microservices/       :3005 (gateway)  Prisma
  nest-event-driven/        :3006  Prisma
```

Un solo repo git en la raíz. Cada carpeta es autónoma (su propio `package.json`, lockfile, `docker-compose.yml`), sin workspaces ni dependencias compartidas, para poder extraerla sola con `npx degit <usuario>/<repo>/<carpeta> mi-app`. `contract/` es la única referencia cruzada y solo se usa para validar, no para correr.

## Dominio y contrato (compartido)

Auth:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- Roles: `USER`, `ADMIN`. JWT access + refresh.

Todo (`id`, `title`, `description?`, `status: PENDING | DONE`, `dueDate?`, `ownerId`, timestamps):
- `GET /todos?page&limit&status&search`, `POST /todos`
- `GET /todos/:id`, `PATCH /todos/:id`, `DELETE /todos/:id`
- `USER` ve solo lo suyo; `ADMIN` ve todo.

Formato de respuesta y de error idéntico en todos (definido en `contract/`). Ese contrato es lo que permite que el front cambie de backend con solo cambiar `VITE_API_URL`.

## Decisión de ORM

Por ser starters, prima la velocidad de arranque y la familiaridad, no probar ORMs.

| Repo | ORM | Motivo |
|---|---|---|
| nest-layered | Prisma | Estándar, el mismo de e-bridge, mejor DX |
| nest-hexagonal | Drizzle | Demuestra que el adaptador de persistencia se cambia sin tocar dominio ni casos de uso |
| nest-ddd-cqrs | TypeORM | Encaja con aggregates y repositories; integra con `@nestjs/cqrs` |
| nest-modular-monolith | Prisma | Un schema por módulo es simple de manejar |
| nest-microservices | Prisma | Una DB por servicio |
| nest-event-driven | Prisma | El foco es la mensajería y el outbox, no el ORM |

Si se prefiere uniformidad, pasar todo a Prisma no cambia el resto del plan.

## Arquitecturas

1. **nest-layered**: referencia directa de e-bridge. `modules/<feature>/{controller,service,repository,dto,module}`, más `common/` (guards, filters, interceptors, pipes, decorators), `config/` y `database/`. Sin `BaseRepository` genérico salvo que haga falta.
2. **nest-hexagonal**: `domain/` (entidades, puertos), `application/` (casos de uso), `infrastructure/` (controllers, adaptadores Drizzle). El dominio no importa Nest ni el ORM.
3. **nest-ddd-cqrs**: aggregates, value objects, commands/queries con handlers, domain events. Un bounded context por módulo.
4. **nest-modular-monolith**: módulos `auth` y `todos` con API pública explícita, sin acceso cruzado a tablas. Comunicación por interfaces/eventos in-process.
5. **nest-microservices**: gateway HTTP + servicio `auth` + servicio `todos`, transporte NATS, DB por servicio.
6. **nest-event-driven**: monolito con publicación de eventos vía Redis (Streams), patrón outbox, consumidor idempotente.

## Front: front-vite-fsd

- Vite + React + TypeScript, TanStack Query, React Router, Tailwind.
- `steiger` en el lint para hacer cumplir los límites entre capas FSD.
- Capas FSD: `app` → `pages` → `features` → `entities` → `shared` (en Vite sí se puede usar `pages`).
- Pantallas: login, registro, lista de todos con filtros y paginación, alta/edición.
- Cliente HTTP único en `shared/api`; el backend activo se elige por `VITE_API_URL`.

## Front: front-next-app-router

- Next.js App Router, TypeScript, mismas pantallas que el front Vite y mismo contrato.
- Estructura feature-based simple (`app/`, `features/`, `shared/`), con frontera server/client explícita.
- Auth con JWT en cookie httpOnly manejada del lado servidor; `NEXT_PUBLIC_*` solo para valores públicos (URL de la API).
- Se hace después del front Vite, como etapa aparte.

## Convenciones comunes (de CLAUDE.md global)

- Node 22, pnpm, TypeScript estricto, ESLint + Prettier.
- Controller → Service → Repository (o su equivalente en cada arquitectura), DTOs validados, sin `console.log`.
- `select` explícito, paginación, sin N+1, migraciones versionadas, nunca `synchronize` en prod.
- `.env.example` con todas las variables; `.env` fuera del repo.
- `docker-compose.yml` con Postgres (y broker donde aplique). Scripts: `dev`, `build`, `lint`, `typecheck`, `migrate`, `seed`.
- Swagger/OpenAPI generado y comparado contra `contract/`.
- README corto por carpeta: qué arquitectura es, diagrama de capas, cómo correr y **cómo reemplazar `Todo` por otro dominio**.

## Etapas

1. **Contrato**: `contract/` con OpenAPI de auth y todos, formato de respuesta y de error.
2. **Front** `front-vite-fsd` contra un mock del contrato.
3. **nest-layered**: primer backend completo. Valida el contrato y el front.
4. **nest-hexagonal** y **nest-ddd-cqrs**.
5. **nest-modular-monolith**.
6. **nest-microservices** y **nest-event-driven**.
7. **front-next-app-router** contra cualquiera de los backends ya hechos.
8. Revisión transversal: que los 6 cumplan el contrato y que ambos fronts funcionen con cada uno.

Cada etapa se revisa antes de pasar a la siguiente.

## Flujo de trabajo

- Una rama, un commit y un PR por carpeta (`feat/<carpeta>`, commit `feat(<carpeta>): ...`), mergeado con **Squash and merge**.
- Se implementa todo, se corre lint + typecheck + build, se revisa y prueba en local sin commitear; recién al aprobar se hace el único commit.
- Cambios al contrato o a este plan van en el PR de la carpeta que los motiva, o en uno propio si son independientes.

## Definición de terminado (por carpeta)

- `docker compose up` levanta DB y API; las migraciones corren limpias.
- Auth y CRUD de todos cumplen el contrato; el front funciona apuntando a ese repo.
- Lint y typecheck sin errores.
- README con diagrama y guía para cambiar el dominio.
- Sin dependencias ni código que no se use.

## Decisiones tomadas

- ORM mixto (Prisma / Drizzle / TypeORM según la tabla).
- Event-driven con Redis (Streams). Redis es una base en memoria que también sirve de broker de mensajes; se levanta con una línea en `docker-compose`.
- Microservicios con NATS. TCP queda descartado: es de juguete y cambiar de transporte en Nest es un cambio de configuración, no hace falta un repo extra.
- Segundo front con Next.js incluido.
- Un solo repo con carpetas autónomas; reutilización vía `degit` de la subcarpeta.
- `package.json` en la raíz solo con atajos (`pnpm front`, `pnpm <backend>`, `pnpm <backend>:docker`) que corren `pnpm -C <carpeta>`. Sin dependencias ni `pnpm-workspace.yaml`: no viaja con `degit` y ninguna carpeta depende de él. Cada backend nuevo suma sus dos scripts.
- Contrato: sin envoltorio en recursos sueltos, `{ data, meta }` en listados, schema `Error` único, `404` (no `403`) para todos ajenos, refresh con rotación, logout idempotente (`204` siempre).
- TypeScript 5.9 en el front y 6.0 en los Nest (la que trae el CLI de Nest 12), nunca 7: TS 7 no expone la API de JS que usan `openapi-typescript`, `steiger` y `typescript-eslint`.
- ESLint en vez de `oxlint` (que traen las plantillas de Vite 8 y Nest 12), igual en front y backends.
- Backends Nest: Nest 12 (ESM), Prettier sin `;` como el front, sin tests, JWT con `@nestjs/jwt` + guard global propio (sin passport), `bcryptjs`, refresh token opaco guardado como hash SHA-256. Postgres expuesto en el host en `5400 + n` (`nest-layered` → 5401).
- Prisma 7 estable (no la 8 RC que npm marca como `latest`), con `@prisma/adapter-pg` y cliente generado en `src/generated`.
- nest-hexagonal: Drizzle 0.45 estable (no la 1.0 RC) con `pg`; puertos como `abstract class` (token de DI sin importar Nest); casos de uso sin decoradores, registrados con `provideUseCase`; límites de capas con `no-restricted-imports` de ESLint; columnas snake_case vía `casing`; Docker aplica migraciones con el migrador de `drizzle-orm` compilado (sin `drizzle-kit` en prod).
- front-vite-fsd: tipos generados desde el contrato (`pnpm gen:api`) con `openapi-fetch`; mock con Prism (`pnpm mock`, :4010, sin estado); `steiger` con `fsd/insignificant-slice` desactivada porque en el starter cada feature se usa una sola vez.
