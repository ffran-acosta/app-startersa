import type { ReactNode } from 'react'
import { TODO_STATUS_LABEL, type Todo } from '../model/types'

type TodoItemProps = {
  todo: Todo
  /** Acciones inyectadas desde capas superiores (features). */
  actions?: ReactNode
}

export function TodoItem({ todo, actions }: TodoItemProps) {
  const done = todo.status === 'DONE'

  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className={`font-medium ${done ? 'text-slate-400 line-through' : ''}`}
        >
          {todo.title}
        </span>
        {todo.description && (
          <p className="text-sm text-slate-600">{todo.description}</p>
        )}
        <div className="flex gap-3 text-xs text-slate-500">
          <span>{TODO_STATUS_LABEL[todo.status]}</span>
          {todo.dueDate && (
            <span>
              Vence{' '}
              {new Date(todo.dueDate).toLocaleDateString('es', {
                timeZone: 'UTC',
              })}
            </span>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </li>
  )
}
