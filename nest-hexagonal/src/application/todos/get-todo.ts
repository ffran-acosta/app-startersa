import type { TodoRepository } from '../../domain/todo/todo.repository.js'
import { visibleOwnerId, type Todo } from '../../domain/todo/todo.js'
import type { Actor } from '../../domain/user/user.js'
import { NotFoundError } from '../errors.js'

export class GetTodo {
  constructor(private readonly todos: TodoRepository) {}

  async execute(actor: Actor, id: string): Promise<Todo> {
    const todo = await this.todos.findById(id, visibleOwnerId(actor))
    if (!todo) throw new NotFoundError('Todo not found')
    return todo
  }
}
