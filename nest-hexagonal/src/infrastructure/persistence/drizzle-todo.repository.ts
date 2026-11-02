import { Injectable } from '@nestjs/common'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import type {
  TodoFilter,
  TodoRepository,
} from '../../domain/todo/todo.repository.js'
import type { NewTodo, Todo, TodoChanges } from '../../domain/todo/todo.js'
import { DrizzleService } from './drizzle.service.js'
import { todos } from './schema.js'

const todoColumns = {
  id: todos.id,
  title: todos.title,
  description: todos.description,
  status: todos.status,
  dueDate: todos.dueDate,
  ownerId: todos.ownerId,
  createdAt: todos.createdAt,
  updatedAt: todos.updatedAt,
}

@Injectable()
export class DrizzleTodoRepository implements TodoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findPage(
    { ownerId, status, search }: TodoFilter,
    offset: number,
    limit: number,
  ) {
    const pattern = search && `%${search.replace(/[\\%_]/g, '\\$&')}%`
    const where = and(
      ownedBy(ownerId),
      status && eq(todos.status, status),
      pattern
        ? or(ilike(todos.title, pattern), ilike(todos.description, pattern))
        : undefined,
    )
    const [items, total] = await Promise.all([
      this.drizzle.db
        .select(todoColumns)
        .from(todos)
        .where(where)
        .orderBy(desc(todos.createdAt))
        .limit(limit)
        .offset(offset),
      this.drizzle.db.$count(todos, where),
    ])
    return { items, total }
  }

  async findById(id: string, ownerId?: string): Promise<Todo | null> {
    const [todo] = await this.drizzle.db
      .select(todoColumns)
      .from(todos)
      .where(and(eq(todos.id, id), ownedBy(ownerId)))
    return todo ?? null
  }

  async create(todo: NewTodo): Promise<Todo> {
    const [created] = await this.drizzle.db
      .insert(todos)
      .values(todo)
      .returning(todoColumns)
    return created
  }

  async update(
    id: string,
    changes: TodoChanges,
    ownerId?: string,
  ): Promise<Todo | null> {
    const [updated] = await this.drizzle.db
      .update(todos)
      .set(changes)
      .where(and(eq(todos.id, id), ownedBy(ownerId)))
      .returning(todoColumns)
    return updated ?? null
  }

  async delete(id: string, ownerId?: string): Promise<boolean> {
    const deleted = await this.drizzle.db
      .delete(todos)
      .where(and(eq(todos.id, id), ownedBy(ownerId)))
      .returning({ id: todos.id })
    return deleted.length > 0
  }
}

function ownedBy(ownerId: string | undefined) {
  return ownerId === undefined ? undefined : eq(todos.ownerId, ownerId)
}
