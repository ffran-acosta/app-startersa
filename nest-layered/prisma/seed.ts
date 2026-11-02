import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import {
  PrismaClient,
  Role,
  TodoStatus,
} from '../src/generated/prisma/client.js'

const { DATABASE_URL, SEED_PASSWORD } = process.env
if (!DATABASE_URL || !SEED_PASSWORD) {
  throw new Error('DATABASE_URL and SEED_PASSWORD are required')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

const users = await Promise.all(
  [
    { email: 'admin@example.com', name: 'Admin', role: Role.ADMIN },
    { email: 'user@example.com', name: 'User', role: Role.USER },
  ].map((user) =>
    prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
      select: { id: true },
    }),
  ),
)

for (const { id } of users) {
  if ((await prisma.todo.count({ where: { ownerId: id } })) > 0) continue
  await prisma.todo.createMany({
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

await prisma.$disconnect()
