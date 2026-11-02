import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  TODO_STATUS_LABEL,
  TODO_STATUSES,
  todoKeys,
  type Todo,
} from '@/entities/todo'
import { api, getErrorMessage } from '@/shared/api'
import { Alert, Button, FormField, Input, Select, Textarea } from '@/shared/ui'
import {
  toFormValues,
  todoFormSchema,
  toRequestBody,
  type TodoFormValues,
} from '../model/todo-form-schema'

type TodoFormProps = {
  /** Si viene, el formulario edita; si no, crea. */
  todo?: Todo
  onSuccess: () => void
}

export function TodoForm({ todo, onSuccess }: TodoFormProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: toFormValues(todo),
  })

  const save = useMutation({
    mutationFn: async (values: TodoFormValues) => {
      const body = toRequestBody(values)
      const { data, error } = todo
        ? await api.PATCH('/todos/{id}', {
            params: { path: { id: todo.id } },
            body,
          })
        : await api.POST('/todos', { body })
      if (error) throw error
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all })
      onSuccess()
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => save.mutate(values))}
    >
      {save.isError && <Alert message={getErrorMessage(save.error)} />}
      <FormField label="Título" error={errors.title?.message}>
        <Input aria-invalid={!!errors.title} {...register('title')} />
      </FormField>
      <FormField label="Descripción" error={errors.description?.message}>
        <Textarea
          aria-invalid={!!errors.description}
          {...register('description')}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Estado" error={errors.status?.message}>
          <Select {...register('status')}>
            {TODO_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TODO_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Vencimiento" error={errors.dueDate?.message}>
          <Input type="date" {...register('dueDate')} />
        </FormField>
      </div>
      <Button type="submit" disabled={save.isPending}>
        {todo ? 'Guardar cambios' : 'Crear'}
      </Button>
    </form>
  )
}
