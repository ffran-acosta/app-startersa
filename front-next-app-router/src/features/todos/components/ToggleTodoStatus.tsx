import { SubmitButton } from '@/shared/ui/SubmitButton'
import { setTodoStatus } from '../actions'
import type { Todo } from '../types'

export function ToggleTodoStatus({ todo }: { todo: Todo }) {
  const done = todo.status === 'DONE'

  return (
    <form action={setTodoStatus.bind(null, todo.id, done ? 'PENDING' : 'DONE')}>
      <SubmitButton variant="secondary">
        {done ? 'Reabrir' : 'Completar'}
      </SubmitButton>
    </form>
  )
}
