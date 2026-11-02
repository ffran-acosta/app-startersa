import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { TodoStatus } from '../src/domain/todo/todo.js'
import { Role } from '../src/domain/user/user.js'
import { todos, users } from '../src/infrastructure/persistence/schema.js'

const { DATABASE_URL, SEED_PASSWORD } = process.env
if (!DATABASE_URL || !SEED_PASSWORD) {
  throw new Error('DATABASE_URL and SEED_PASSWORD are required')
}

const db = drizzle({ connection: DATABASE_URL, casing: 'snake_case' })

const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
const seedUsers = [
  { email: 'admin@example.com', name: 'Admin', role: Role.ADMIN },
  { email: 'user@example.com', name: 'User', role: Role.USER },
]

await db
  .insert(users)
  .values(seedUsers.map((user) => ({ ...user, passwordHash })))
  .onConflictDoNothing({ target: users.email })

const seeded = await db
  .select({ id: users.id })
  .from(users)
  .where(
    inArray(
      users.email,
      seedUsers.map((user) => user.email),
    ),
  )

for (const { id } of seeded) {
  if ((await db.$count(todos, eq(todos.ownerId, id))) > 0) continue
  await db.insert(todos).values([
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
  ])
}

await db.$client.end()
