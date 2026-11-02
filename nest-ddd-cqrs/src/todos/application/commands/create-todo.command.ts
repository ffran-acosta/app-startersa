import {
  Command,
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@nestjs/cqrs'
import type { Actor } from '../../../shared/domain/actor.js'
import { TodoRepository } from '../../domain/todo.repository.js'
import { Todo, type TodoInput } from '../../domain/todo.js'

/** Devuelve el `id` del todo creado. */
export class CreateTodoCommand extends Command<string> {
  constructor(
    readonly actor: Actor,
    readonly input: TodoInput,
  ) {
    super()
  }
}

@CommandHandler(CreateTodoCommand)
export class CreateTodoHandler implements ICommandHandler<CreateTodoCommand> {
  constructor(
    private readonly todos: TodoRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ actor, input }: CreateTodoCommand): Promise<string> {
    const todo = Todo.create(input, actor.id)
    await this.todos.save(todo)
    this.eventBus.publishAll(todo.pullEvents())
    return todo.id
  }
}
