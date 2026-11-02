import type { TodoRepository } from '../../domain/todo/todo.repository.js'
import { visibleOwnerId } from '../../domain/todo/todo.js'
import type { Actor } from '../../domain/user/user.js'
import { NotFoundError } from '../errors.js'

export class DeleteTodo {
  constructor(private readonly todos: TodoRepository) {}

  async execute(actor: Actor, id: string): Promise<void> {
    const deleted = await this.todos.delete(id, visibleOwnerId(actor))
    if (!deleted) throw new NotFoundError('Todo not found')
  }
}
