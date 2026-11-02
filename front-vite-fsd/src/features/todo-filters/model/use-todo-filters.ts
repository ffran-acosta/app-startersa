import { useSearchParams } from 'react-router'
import { TODO_STATUSES, type TodoListParams } from '@/entities/todo'

const PAGE_SIZE = 10

export type TodoFiltersValue = Pick<
  TodoListParams,
  'page' | 'status' | 'search'
>

export function parseStatus(value: string | null) {
  return TODO_STATUSES.find((status) => status === value)
}

/** Filtros y página viven en la URL: se pueden compartir y sobreviven recargas. */
export function useTodoFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: TodoListParams = {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: PAGE_SIZE,
    status: parseStatus(searchParams.get('status')),
    search: searchParams.get('search') || undefined,
  }

  function setFilters(next: TodoFiltersValue) {
    setSearchParams((current) => {
      const updated = new URLSearchParams(current)
      // Cambiar un filtro vuelve a la primera página.
      if (!('page' in next)) updated.delete('page')
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined) updated.delete(key)
        else updated.set(key, String(value))
      }
      return updated
    })
  }

  return { params, setFilters }
}
