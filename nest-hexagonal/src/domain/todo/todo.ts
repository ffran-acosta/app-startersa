import { Role, type Actor } from '../user/user.js'

export enum TodoStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface Todo {
  id: string
  title: string
  description: string | null
  status: TodoStatus
  dueDate: Date | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface NewTodo {
  title: string
  description?: string | null
  status?: TodoStatus
  dueDate?: Date | null
  ownerId: string
}

/** `undefined` no toca el campo; `null` lo borra. */
export type TodoChanges = Partial<Omit<NewTodo, 'ownerId'>>

/**
 * Un `USER` solo ve lo suyo (lo ajeno responde 404); `ADMIN` ve todo.
 * Devuelve el `ownerId` por el que filtrar, o `undefined` para no filtrar.
 */
export function visibleOwnerId(actor: Actor): string | undefined {
  return actor.role === Role.ADMIN ? undefined : actor.id
}
