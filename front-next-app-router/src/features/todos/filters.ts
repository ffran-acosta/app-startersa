import { parseStatus, type TodoListParams } from './types'

const PAGE_SIZE = 10

type SearchParams = Record<string, string | string[] | undefined>

/** Filtros y página viven en la URL: se pueden compartir y sobreviven recargas. */
export function parseTodoFilters(searchParams: SearchParams): TodoListParams {
  const first = (key: string) => [searchParams[key]].flat()[0]
  return {
    page: Math.max(1, Number(first('page')) || 1),
    limit: PAGE_SIZE,
    status: parseStatus(first('status')),
    search: first('search')?.trim() || undefined,
  }
}

export function todosHref({ page, status, search }: TodoListParams) {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  if (status) query.set('status', status)
  if (page && page > 1) query.set('page', String(page))
  const qs = query.toString()
  return qs ? `/todos?${qs}` : '/todos'
}
