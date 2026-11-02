import type { TodoRepository } from '../../domain/todo/todo.repository.js'
import {
  visibleOwnerId,
  type Todo,
  type TodoChanges,
} from '../../domain/todo/todo.js'
import type { Actor } from '../../domain/user/user.js'
import { NotFoundError } from '../errors.js'

export class UpdateTodo {
  constructor(private readonly todos: TodoRepository) {}

  async execute(actor: Actor, id: string, changes: TodoChanges): Promise<Todo> {
    const todo = await this.todos.update(id, changes, visibleOwnerId(actor))
    if (!todo) throw new NotFoundError('Todo not found')
    return todo
  }
}
