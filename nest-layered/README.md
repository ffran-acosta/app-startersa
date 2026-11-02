# nest-layered

Backend starter con **arquitectura en capas**: NestJS 12 + Prisma 7 + PostgreSQL. Implementa `../contract/openapi.yaml` (auth JWT + CRUD de `Todo`) en el puerto `3001`.

## Capas

```
HTTP
  ↓
Controller   rutas, DTOs validados (class-validator), @CurrentUser
  ↓
Service      reglas de negocio: permisos (USER ve lo suyo, ADMIN todo), 404, 409, tokens
  ↓
Repository   acceso a datos con Prisma, `select` explícito
  ↓
PostgreSQL
```

```
src/
  main.ts           CORS, Swagger (/docs)
  app.module.ts     guard JWT, ValidationPipe y filtro de errores globales
  config/           validación del env al arrancar
  database/         PrismaService (adapter pg)
  common/
    guards/         JwtAuthGuard global; @Public() lo saltea
    decorators/     @Public(), @CurrentUser()
    pipes/          ValidationPipe → `details: [{ field, message }]`
    filters/        toda respuesta de error sigue el schema `Error` del contrato
  modules/
    auth/           register, login, refresh (con rotación), logout, me
    users/          repositorio de usuarios (lo usa auth)
    todos/          controller → service → repository
prisma/             schema, migraciones, seed
```

Cada módulo solo usa lo que otro exporta explícitamente (`users` exporta `UsersRepository`).

## Correr

```bash
pnpm install
cp .env.example .env
docker compose up -d db      # Postgres en localhost:5401
pnpm migrate                 # aplica/crea migraciones
pnpm seed                    # admin@example.com y user@example.com, contraseña = SEED_PASSWORD
pnpm dev                     # http://localhost:3001, Swagger en /docs
```

Todo en Docker (API + DB, corre `prisma migrate deploy` al arrancar): `docker compose up --build`.

Para usarlo desde el front: `VITE_API_URL=http://localhost:3001` en `front-vite-fsd/.env`.

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

1. `prisma/schema.prisma`: reemplazá el modelo `Todo` (y su enum) y corré `pnpm migrate --name <nombre>`. Borrá la migración inicial si arrancás de cero.
2. Copiá `src/modules/todos` a `src/modules/<entidad>` y adaptá:
   - `*.repository.ts`: el `select` y los tipos de Prisma.
   - `dto/`: validaciones de alta, edición y query.
   - `*.service.ts`: reglas de negocio; `scope()` define qué ve cada rol.
   - `*.controller.ts`: rutas.
3. Registrá el módulo nuevo en `app.module.ts` y borrá `todos`.
4. Actualizá `prisma/seed.ts` y el contrato.

`auth`, `users`, `common`, `config` y `database` no cambian.

## No incluido

Pensado para agregar cuando haga falta: `RolesGuard` (hoy ningún endpoint es exclusivo de `ADMIN`), rate limiting en auth, `helmet`, limpieza periódica de refresh tokens vencidos, tests.
