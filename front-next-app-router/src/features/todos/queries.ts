import 'server-only'
import { api } from '@/shared/api/client'
import type { TodoListParams } from './types'

export function listTodos(params: TodoListParams) {
  return api.GET('/todos', { params: { query: params } })
}

export function getTodo(id: string) {
  return api.GET('/todos/{id}', { params: { path: { id } } })
}
