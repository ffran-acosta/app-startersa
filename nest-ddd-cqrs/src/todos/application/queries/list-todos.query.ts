import { Query, QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Actor } from '../../../shared/domain/actor.js'
import { visibleOwnerId, type TodoStatus } from '../../domain/todo.js'
import { TodoReadModel, type TodoView } from './todo-read-model.js'

export interface ListTodosParams {
  page: number
  limit: number
  status?: TodoStatus
  search?: string
}

export interface TodoPage {
  data: TodoView[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export class ListTodosQuery extends Query<TodoPage> {
  constructor(
    readonly actor: Actor,
    readonly params: ListTodosParams,
  ) {
    super()
  }
}

@QueryHandler(ListTodosQuery)
export class ListTodosHandler implements IQueryHandler<ListTodosQuery> {
  constructor(private readonly todos: TodoReadModel) {}

  async execute({ actor, params }: ListTodosQuery): Promise<TodoPage> {
    const { page, limit, status, search } = params
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
