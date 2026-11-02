import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { In } from 'typeorm'
import { UserEntity } from '../identity/infrastructure/persistence/user.entity.js'
import { Role } from '../shared/domain/actor.js'
import { TodoStatus } from '../todos/domain/todo.js'
import { TodoEntity } from '../todos/infrastructure/persistence/todo.entity.js'
import dataSource from './data-source.js'

const { SEED_PASSWORD } = process.env
if (!SEED_PASSWORD) throw new Error('SEED_PASSWORD is required')

await dataSource.initialize()
const users = dataSource.getRepository(UserEntity)
const todos = dataSource.getRepository(TodoEntity)

const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
const seedUsers = [
  { email: 'admin@example.com', name: 'Admin', role: Role.ADMIN },
  { email: 'user@example.com', name: 'User', role: Role.USER },
]

await users
  .createQueryBuilder()
  .insert()
  .values(
    seedUsers.map((user) => ({ ...user, id: randomUUID(), passwordHash })),
  )
  .orIgnore()
  .execute()

const seeded = await users.find({
  select: { id: true },
  where: { email: In(seedUsers.map((user) => user.email)) },
})

for (const { id: ownerId } of seeded) {
  if (await todos.existsBy({ ownerId })) continue
  await todos.insert([
    {
      id: randomUUID(),
      title: 'Leer el README',
      status: TodoStatus.DONE,
      ownerId,
    },
    {
      id: randomUUID(),
      title: 'Reemplazar Todo por el dominio real',
      description: 'Ver la guía del README',
      ownerId,
    },
    {
      id: randomUUID(),
      title: 'Configurar el deploy',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ownerId,
    },
  ])
}

await dataSource.destroy()
