import type { NewTodo, Todo, TodoChanges, TodoStatus } from './todo.js'

export interface TodoFilter {
  ownerId?: string
  status?: TodoStatus
  /** Case-insensitive sobre `title` y `description`. */
  search?: string
}

/** En los métodos por `id`, `ownerId` restringe a los todos de ese dueño. */
export abstract class TodoRepository {
  abstract findPage(
    filter: TodoFilter,
    offset: number,
    limit: number,
  ): Promise<{ items: Todo[]; total: number }>
  abstract findById(id: string, ownerId?: string): Promise<Todo | null>
  abstract create(todo: NewTodo): Promise<Todo>
  abstract update(
    id: string,
    changes: TodoChanges,
    ownerId?: string,
  ): Promise<Todo | null>
  abstract delete(id: string, ownerId?: string): Promise<boolean>
}
