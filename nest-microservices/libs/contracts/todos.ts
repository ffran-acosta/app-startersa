import type { AuthUser } from './auth.js'

export const TodoStatus = { PENDING: 'PENDING', DONE: 'DONE' } as const
export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus]

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

export interface TodoPage {
  data: TodoView[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ListTodosQuery {
  page: number
  limit: number
  status?: TodoStatus
  search?: string
}

export interface CreateTodoData {
  title: string
  description?: string | null
  status?: TodoStatus
  /** RFC 3339 */
  dueDate?: string | null
}

/** Parcial: un campo ausente no se toca; `null` borra `description` o `dueDate`. */
export type UpdateTodoData = Partial<CreateTodoData>

export interface TodosMessages {
  'todos.list': {
    payload: { user: AuthUser; query: ListTodosQuery }
    result: TodoPage
  }
  'todos.create': {
    payload: { user: AuthUser; data: CreateTodoData }
    result: TodoView
  }
  'todos.get': { payload: { user: AuthUser; id: string }; result: TodoView }
  'todos.update': {
    payload: { user: AuthUser; id: string; data: UpdateTodoData }
    result: TodoView
  }
  'todos.remove': { payload: { user: AuthUser; id: string }; result: null }
}
