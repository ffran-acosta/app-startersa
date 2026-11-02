import type { TodoStatus } from '../../domain/todo.js'

/** Lo que devuelve la API: el aggregate no se expone en las lecturas. */
export interface TodoView {
  id: string
  title: string
  description: string | null
  status: TodoStatus
  dueDate: Date | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface TodoFilter {
  ownerId?: string
  status?: TodoStatus
  /** Case-insensitive sobre `title` y `description`. */
  search?: string
}

/** Lado de lectura: consultas directas a la DB, sin pasar por el aggregate. */
export abstract class TodoReadModel {
  abstract findPage(
    filter: TodoFilter,
    offset: number,
    limit: number,
  ): Promise<{ items: TodoView[]; total: number }>
  /** `ownerId` restringe a los todos de ese dueño. */
  abstract findById(id: string, ownerId?: string): Promise<TodoView | null>
}
