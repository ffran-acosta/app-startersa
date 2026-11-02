'use client'

import { useActionState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { FormField } from '@/shared/ui/FormField'
import { Input, Select, Textarea } from '@/shared/ui/Input'
import { SubmitButton } from '@/shared/ui/SubmitButton'
import { saveTodo } from '../actions'
import { TODO_STATUS_LABEL, TODO_STATUSES, type Todo } from '../types'

type TodoFormProps = {
  /** Si viene, el formulario edita; si no, crea. */
  todo?: Todo
}

export function TodoForm({ todo }: TodoFormProps) {
  const [state, action] = useActionState(saveTodo.bind(null, todo?.id), {})
  const values = state.values ?? {
    title: todo?.title ?? '',
    description: todo?.description ?? '',
    status: todo?.status ?? 'PENDING',
    dueDate: todo?.dueDate?.slice(0, 10) ?? '',
  }

  return (
    <form noValidate action={action} className="flex flex-col gap-4">
      {state.message && <Alert message={state.message} />}
      <FormField label="Título" error={state.errors?.title?.[0]}>
        <Input
          name="title"
          defaultValue={values.title}
          aria-invalid={!!state.errors?.title}
        />
      </FormField>
      <FormField label="Descripción" error={state.errors?.description?.[0]}>
        <Textarea
          name="description"
          defaultValue={values.description}
          aria-invalid={!!state.errors?.description}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Estado" error={state.errors?.status?.[0]}>
          <Select name="status" defaultValue={values.status}>
            {TODO_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TODO_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Vencimiento" error={state.errors?.dueDate?.[0]}>
          <Input
            name="dueDate"
            type="date"
            defaultValue={values.dueDate}
            aria-invalid={!!state.errors?.dueDate}
          />
        </FormField>
      </div>
      <SubmitButton>{todo ? 'Guardar cambios' : 'Crear'}</SubmitButton>
    </form>
  )
}
