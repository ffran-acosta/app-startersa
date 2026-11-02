import type { TodoRepository } from '../../domain/todo/todo.repository.js'
import {
  visibleOwnerId,
  type Todo,
  type TodoStatus,
} from '../../domain/todo/todo.js'
import type { Actor } from '../../domain/user/user.js'

export interface ListTodosInput {
  page: number
  limit: number
  status?: TodoStatus
  search?: string
}

export interface TodoPage {
  data: Todo[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export class ListTodos {
  constructor(private readonly todos: TodoRepository) {}

  async execute(actor: Actor, input: ListTodosInput): Promise<TodoPage> {
    const { page, limit, status, search } = input
    const { items, total } = await this.todos.findPage(
      { ownerId: visibleOwnerId(actor), status, search },
      (page - 1) * limit,
      limit,
    )
    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }
}
