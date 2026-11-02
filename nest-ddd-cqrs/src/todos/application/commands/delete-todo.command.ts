import {
  Command,
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@nestjs/cqrs'
import { NotFoundError } from '../../../shared/application/errors.js'
import type { Actor } from '../../../shared/domain/actor.js'
import { TodoRepository } from '../../domain/todo.repository.js'

export class DeleteTodoCommand extends Command<void> {
  constructor(
    readonly actor: Actor,
    readonly id: string,
  ) {
    super()
  }
}

@CommandHandler(DeleteTodoCommand)
export class DeleteTodoHandler implements ICommandHandler<DeleteTodoCommand> {
  constructor(
    private readonly todos: TodoRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ actor, id }: DeleteTodoCommand): Promise<void> {
    const todo = await this.todos.findById(id)
    if (!todo?.isVisibleTo(actor)) throw new NotFoundError('Todo not found')
    todo.delete()
    await this.todos.delete(todo)
    this.eventBus.publishAll(todo.pullEvents())
  }
}
