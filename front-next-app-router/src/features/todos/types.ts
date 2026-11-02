import type { components, paths } from '@/shared/api/schema'

export type Todo = components['schemas']['Todo']
export type TodoStatus = components['schemas']['TodoStatus']
export type TodoListParams = NonNullable<
  paths['/todos']['get']['parameters']['query']
>

export const TODO_STATUSES = [
  'PENDING',
  'DONE',
] as const satisfies readonly TodoStatus[]

export const TODO_STATUS_LABEL: Record<TodoStatus, string> = {
  PENDING: 'Pendiente',
  DONE: 'Hecho',
}

export function parseStatus(value: unknown) {
  return TODO_STATUSES.find((status) => status === value)
}
