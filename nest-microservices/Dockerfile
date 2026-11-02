# Una imagen para las tres apps; docker-compose elige cuál corre.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps/auth/prisma.config.ts ./apps/auth/
COPY apps/auth/prisma ./apps/auth/prisma
COPY apps/todos/prisma.config.ts ./apps/todos/
COPY apps/todos/prisma ./apps/todos/prisma
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod --ignore-scripts

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/apps/auth/prisma.config.ts ./apps/auth/
COPY --from=build /app/apps/auth/prisma ./apps/auth/prisma
COPY --from=build /app/apps/todos/prisma.config.ts ./apps/todos/
COPY --from=build /app/apps/todos/prisma ./apps/todos/prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
