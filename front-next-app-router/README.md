# front-next-app-router

Front starter con **Next.js 16 (App Router)**, React Server Components, Server Actions, TypeScript y Tailwind. La estructura es feature-based. Consume el contrato de `../contract/openapi.yaml`, así que funciona contra cualquier backend `nest-*` o contra un mock. Tiene las mismas pantallas que `front-vite-fsd`.

## Capas

```
app       rutas: (auth)/login, (auth)/register, (app)/todos[/new|/[id]/edit],
          session-expired; layouts y Suspense
  ↓
features  auth  (actions, LoginForm, RegisterForm, LogoutButton, UserName)
          todos (queries, actions, filters, TodoItem, TodoForm, TodoFilters...)
  ↓
shared    api (cliente tipado, cookies de sesión), config, lib, ui
```

`proxy.ts` (antes `middleware`) se ocupa de las redirecciones según haya sesión y de renovar el access token.

**Frontera server/client:**

- Por defecto todo es Server Component. Las lecturas (`features/*/queries.ts`, `shared/api/client.ts`) llevan `server-only`, y las escrituras son Server Actions (`features/*/actions.ts`, `'use server'`).
- Solo son `'use client'` los componentes que necesitan estado del navegador: los formularios con `useActionState`, `SubmitButton` (`useFormStatus`) y `DeleteTodoButton` (`confirm`).
- No hay TanStack Query ni React Hook Form. Los datos se leen en el server y, después de mutar, se refrescan con `refresh()` / `revalidatePath`. La validación usa zod en la action, y los errores vuelven con los valores cargados.

`cacheComponents` está activo. Por eso, todo lo que lee cookies o `searchParams` está dentro de `<Suspense>`, y el resto de la página se prerenderiza.

## Correr

```bash
pnpm install
cp .env.example .env     # API_URL
pnpm mock                # mock del contrato en :4010 (Prism)
pnpm dev                 # :3000
```

`API_URL` solo se lee en el server, porque el navegador nunca habla con la API. Para usar un backend real, cambiala (`http://localhost:3001` para `nest-layered`, etc.). El mock genera datos aleatorios y no guarda estado, así que el login "funciona", pero los todos que crees no aparecen en la lista.

| Script                    | Qué hace                                                |
| ------------------------- | ------------------------------------------------------- |
| `dev` / `build` / `start` | Next                                                    |
| `lint`                    | ESLint (`eslint-config-next` + Prettier)                |
| `typecheck`               | `next typegen` + `tsc --noEmit`                         |
| `format`                  | Prettier                                                |
| `mock`                    | Prism sobre `../contract/openapi.yaml`                  |
| `gen:api`                 | Regenera `src/shared/api/schema.d.ts` desde el contrato |

`mock` y `gen:api` usan `../contract`. Si copiaste la carpeta sola con `degit`, apuntalos a tu propio spec o borralos.

## Auth

- **Cookies:** los tokens viven en dos cookies httpOnly: `access_token` (dura lo que `expiresIn`, menos 30 s de margen) y `refresh_token` (7 días). Las escriben las Server Actions de login y registro, y el JS del navegador no las ve.
- **Bearer:** el cliente (`shared/api/client.ts`) lee la cookie y agrega el `Bearer` a cada request.
- **Renovación:** cuando la cookie de access venció y queda la de refresh, `proxy.ts` pide tokens nuevos antes del render y escribe las cookies, porque los Server Components no pueden escribirlas. Si el refresh falla, borra la sesión y redirige a `/login`.
- **Deduplicación:** el backend rota el refresh token, así que dos requests concurrentes con la cookie vieja reciben el mismo par durante 10 s (`refreshTokens` en `shared/api/session.ts`). Esto vive en memoria y solo sirve con una instancia. Con varias réplicas, hay que moverlo a un store compartido o aceptar que alguna request concurrente termine en `/login`.
- **Token rechazado:** si la API responde `401` con token, el cliente redirige a `/session-expired`, un route handler que borra las cookies y manda a `/login`.

## Reemplazar `Todo` por otro dominio

1. Actualizá el spec y corré `pnpm gen:api`. El typecheck te marca todo lo que quedó desalineado.
2. `features/todos` → `features/<entidad>`: tipos, queries, actions (con sus schemas zod), filtros y componentes.
3. `app/(app)/todos/**` → las rutas nuevas, y el link del header en `app/(app)/layout.tsx`.
4. `proxy.ts`: el `matcher`, y las redirecciones a `/todos` (también en `features/auth/actions.ts`).

`shared` y `features/auth` no cambian.
