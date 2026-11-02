import { HttpStatus, Injectable } from '@nestjs/common'
import {
  Role,
  rpcError,
  type AuthUser,
  type CreateTodoData,
  type ListTodosQuery,
  type TodoPage,
  type TodoView,
  type UpdateTodoData,
} from '../../../libs/contracts/index.js'
import type { Prisma } from './generated/prisma/client.js'
import { TodosRepository } from './todos.repository.js'

/** El gateway ya validó los payloads; acá llegan con la forma del contrato. */
@Injectable()
export class TodosService {
  constructor(private readonly todos: TodosRepository) {}

  async list(user: AuthUser, query: ListTodosQuery): Promise<TodoPage> {
    const { page, limit, status, search } = query
    const where: Prisma.TodoWhereInput = {
      ...scope(user),
      status,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    }
    const [data, total] = await this.todos.findPage(
      where,
      (page - 1) * limit,
      limit,
    )
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async get(user: AuthUser, id: string): Promise<TodoView> {
    const todo = await this.todos.findFirst({ id, ...scope(user) })
    if (!todo) throw rpcError(HttpStatus.NOT_FOUND, 'Todo not found')
    return todo
  }

  create(user: AuthUser, data: CreateTodoData): Promise<TodoView> {
    return this.todos.create({ ...data, ownerId: user.id })
  }

  async update(
    user: AuthUser,
    id: string,
    data: UpdateTodoData,
  ): Promise<TodoView> {
    await this.get(user, id)
    return this.todos.update(id, data)
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const deleted = await this.todos.deleteMany({ id, ...scope(user) })
    if (deleted === 0) throw rpcError(HttpStatus.NOT_FOUND, 'Todo not found')
  }
}

/** Un `USER` solo ve lo suyo (lo ajeno responde 404); `ADMIN` ve todo. */
function scope(user: AuthUser): Prisma.TodoWhereInput {
  return user.role === Role.ADMIN ? {} : { ownerId: user.id }
}
