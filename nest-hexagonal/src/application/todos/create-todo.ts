import type { TodoRepository } from '../../domain/todo/todo.repository.js'
import type { NewTodo, Todo } from '../../domain/todo/todo.js'
import type { Actor } from '../../domain/user/user.js'

export class CreateTodo {
  constructor(private readonly todos: TodoRepository) {}

  execute(actor: Actor, input: Omit<NewTodo, 'ownerId'>): Promise<Todo> {
    return this.todos.create({ ...input, ownerId: actor.id })
  }
}
