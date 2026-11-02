'use client'

import { SubmitButton } from '@/shared/ui/SubmitButton'
import { deleteTodo } from '../actions'

export function DeleteTodoButton({ id }: { id: string }) {
  return (
    <form
      action={deleteTodo.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm('¿Eliminar este todo?')) event.preventDefault()
      }}
    >
      <SubmitButton variant="danger">Eliminar</SubmitButton>
    </form>
  )
}
