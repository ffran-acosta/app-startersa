import { Query, QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../shared/application/errors.js'
import type { Actor } from '../../../shared/domain/actor.js'
import { visibleOwnerId } from '../../domain/todo.js'
import { TodoReadModel, type TodoView } from './todo-read-model.js'

export class GetTodoQuery extends Query<TodoView> {
  constructor(
    readonly actor: Actor,
    readonly id: string,
  ) {
    super()
  }
}

@QueryHandler(GetTodoQuery)
export class GetTodoHandler implements IQueryHandler<GetTodoQuery> {
  constructor(private readonly todos: TodoReadModel) {}

  async execute({ actor, id }: GetTodoQuery): Promise<TodoView> {
    const todo = await this.todos.findById(id, visibleOwnerId(actor))
    if (!todo) throw new NotFoundError('Todo not found')
    return todo
  }
}
