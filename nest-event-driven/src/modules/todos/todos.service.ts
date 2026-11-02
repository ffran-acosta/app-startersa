import { Injectable, NotFoundException } from '@nestjs/common'
import type { AuthUser } from '../../common/decorators/current-user.decorator.js'
import { Role, type Prisma } from '../../generated/prisma/client.js'
import type { CreateTodoDto } from './dto/create-todo.dto.js'
import type { ListTodosQueryDto } from './dto/list-todos-query.dto.js'
import type { UpdateTodoDto } from './dto/update-todo.dto.js'
import { TodosRepository, type TodoView } from './todos.repository.js'

@Injectable()
export class TodosService {
  constructor(private readonly todos: TodosRepository) {}

  async list(user: AuthUser, query: ListTodosQueryDto) {
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
    if (!todo) throw new NotFoundException('Todo not found')
    return todo
  }

  create(user: AuthUser, dto: CreateTodoDto): Promise<TodoView> {
    return this.todos.create({ ...dto, ownerId: user.id })
  }

  async update(
    user: AuthUser,
    id: string,
    dto: UpdateTodoDto,
  ): Promise<TodoView> {
    await this.get(user, id)
    return this.todos.update(id, dto, user.id)
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const deleted = await this.todos.delete(id, scope(user), user.id)
    if (!deleted) throw new NotFoundException('Todo not found')
  }
}

/** Un `USER` solo ve lo suyo (lo ajeno responde 404); `ADMIN` ve todo. */
function scope(user: AuthUser): Prisma.TodoWhereInput {
  return user.role === Role.ADMIN ? {} : { ownerId: user.id }
}
