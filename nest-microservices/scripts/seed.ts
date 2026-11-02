import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import {
  PrismaClient as AuthClient,
  Role,
} from '../apps/auth/src/generated/prisma/client.js'
import {
  PrismaClient as TodosClient,
  TodoStatus,
} from '../apps/todos/src/generated/prisma/client.js'

// Escribe en la DB de cada servicio directamente: es un script de desarrollo,
// no pasa por NATS.
const { AUTH_DATABASE_URL, TODOS_DATABASE_URL, SEED_PASSWORD } = process.env
if (!AUTH_DATABASE_URL || !TODOS_DATABASE_URL || !SEED_PASSWORD) {
  throw new Error(
    'AUTH_DATABASE_URL, TODOS_DATABASE_URL and SEED_PASSWORD are required',
  )
}

const auth = new AuthClient({
  adapter: new PrismaPg({ connectionString: AUTH_DATABASE_URL }),
})
const todos = new TodosClient({
  adapter: new PrismaPg({ connectionString: TODOS_DATABASE_URL }),
})

const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

const users = await Promise.all(
  [
    { email: 'admin@example.com', name: 'Admin', role: Role.ADMIN },
    { email: 'user@example.com', name: 'User', role: Role.USER },
  ].map((user) =>
    auth.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
      select: { id: true },
    }),
  ),
)

for (const { id } of users) {
  if ((await todos.todo.count({ where: { ownerId: id } })) > 0) continue
  await todos.todo.createMany({
    data: [
      { title: 'Leer el README', status: TodoStatus.DONE, ownerId: id },
      {
        title: 'Reemplazar Todo por el dominio real',
        description: 'Ver la guía del README',
        ownerId: id,
      },
      {
        title: 'Configurar el deploy',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ownerId: id,
      },
    ],
  })
}

await Promise.all([auth.$disconnect(), todos.$disconnect()])
