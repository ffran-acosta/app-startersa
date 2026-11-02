import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { TodoListParams } from '../model/types'

export const todoKeys = {
  all: ['todos'] as const,
  list: (params: TodoListParams) => [...todoKeys.all, 'list', params] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
}

export function useTodos(params: TodoListParams) {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.GET('/todos', {
        params: { query: params },
      })
      if (error) throw error
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.GET('/todos/{id}', {
        params: { path: { id } },
      })
      if (error) throw error
      return data
    },
  })
}
