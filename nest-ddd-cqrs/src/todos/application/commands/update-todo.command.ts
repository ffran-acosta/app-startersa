import {
  Command,
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@nestjs/cqrs'
import { NotFoundError } from '../../../shared/application/errors.js'
import type { Actor } from '../../../shared/domain/actor.js'
import { TodoRepository } from '../../domain/todo.repository.js'
import type { TodoChanges } from '../../domain/todo.js'

export class UpdateTodoCommand extends Command<void> {
  constructor(
    readonly actor: Actor,
    readonly id: string,
    readonly changes: TodoChanges,
  ) {
    super()
  }
}

@CommandHandler(UpdateTodoCommand)
export class UpdateTodoHandler implements ICommandHandler<UpdateTodoCommand> {
  constructor(
    private readonly todos: TodoRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ actor, id, changes }: UpdateTodoCommand): Promise<void> {
    const todo = await this.todos.findById(id)
    if (!todo?.isVisibleTo(actor)) throw new NotFoundError('Todo not found')
    todo.update(changes)
    await this.todos.save(todo)
    this.eventBus.publishAll(todo.pullEvents())
  }
}
