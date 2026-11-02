export const TodoEvent = {
  Created: 'todo.created',
  Updated: 'todo.updated',
  Deleted: 'todo.deleted',
} as const

export type TodoEventPayload = {
  todoId: string
  actorId: string
}
