import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { TodoStatus } from '../../domain/todo/todo.js'
import { Role } from '../../domain/user/user.js'

export const roleEnum = pgEnum('role', Role)
export const todoStatusEnum = pgEnum('todo_status', TodoStatus)

const createdAt = timestamp({ withTimezone: true }).notNull().defaultNow()
const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date())

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  name: text().notNull(),
  role: roleEnum().notNull().default(Role.USER),
  createdAt,
  updatedAt,
})

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    tokenHash: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt,
  },
  (table) => [index().on(table.userId)],
)

export const todos = pgTable(
  'todos',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 200 }).notNull(),
    description: varchar({ length: 2000 }),
    status: todoStatusEnum().notNull().default(TodoStatus.PENDING),
    dueDate: timestamp({ withTimezone: true }),
    ownerId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt,
    updatedAt,
  },
  (table) => [index().on(table.ownerId, table.createdAt)],
)
