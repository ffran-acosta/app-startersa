import type { Todo } from './todo.js'

/** Lado de escritura: carga y guarda el aggregate completo. */
export abstract class TodoRepository {
  abstract findById(id: string): Promise<Todo | null>
  abstract save(todo: Todo): Promise<void>
  abstract delete(todo: Todo): Promise<void>
}
