# front-vite-fsd

Front starter con **Feature-Sliced Design**: Vite + React + TypeScript, TanStack Query, React Router, Tailwind. Consume el contrato de `../contract/openapi.yaml`, así que funciona contra cualquier backend `nest-*` o contra un mock.

## Capas

```
app       router, guards, layout, QueryClient, estilos globales
  ↓
pages     login, register, todos, todo-form
  ↓
features  auth, todo-filters, todo-upsert, todo-toggle-status, todo-delete
  ↓
entities  session (useMe, useIsAuthenticated), todo (queries, TodoItem)
  ↓
shared    api (cliente tipado + tokens), config, ui
```

Cada capa importa solo de las de abajo, y cada slice expone su API pública en `index.ts`. `steiger` hace cumplir estas reglas en `pnpm lint`.

## Correr

```bash
pnpm install
cp .env.example .env     # VITE_API_URL
pnpm mock                # mock del contrato en :4010 (Prism)
pnpm dev
```

Para usar un backend real, cambiá `VITE_API_URL` (`http://localhost:3001` para `nest-layered`, etc.). El mock genera datos aleatorios y no guarda estado: los todos que crees no aparecen después en la lista.

| Script                      | Qué hace                                                |
| --------------------------- | ------------------------------------------------------- |
| `dev` / `build` / `preview` | Vite                                                    |
| `lint`                      | ESLint + steiger (límites FSD)                          |
| `typecheck`                 | `tsc -b`                                                |
| `format`                    | Prettier                                                |
| `mock`                      | Prism sobre `../contract/openapi.yaml`                  |
| `gen:api`                   | Regenera `src/shared/api/schema.d.ts` desde el contrato |

`mock` y `gen:api` usan `../contract`. Si copiaste la carpeta sola con `degit`, apuntalos a tu propio spec o borralos.

## Auth

El access token vive en memoria y el refresh token en `localStorage`. El cliente (`shared/api/client.ts`) agrega el `Bearer` a cada request. Ante un `401` hace un solo refresh (compartido entre requests concurrentes, porque el backend rota el token) y reintenta el request. Si el refresh falla, limpia la sesión y los guards redirigen a `/login`.

## Reemplazar `Todo` por otro dominio

1. Actualizá el spec y corré `pnpm gen:api`. El typecheck te va a marcar todo lo que quedó desalineado.
2. `entities/todo` → `entities/<entidad>`: tipos, query keys, queries y la card.
3. `features/todo-*` → las acciones del nuevo dominio (filtros, alta/edición, borrado...).
4. `pages/todos` y `pages/todo-form` → las pantallas nuevas.
5. Rutas en `app/router.tsx` y el link del header en `app/layouts/AppLayout.tsx`.

`shared` y `entities/session` no cambian.
