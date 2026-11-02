import { z } from 'zod'
import { TODO_STATUSES, type Todo } from '@/entities/todo'

export const todoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(200, 'Máximo 200 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres'),
  status: z.enum(TODO_STATUSES),
  /** `YYYY-MM-DD` del input date, o vacío. */
  dueDate: z.string(),
})

export type TodoFormValues = z.infer<typeof todoFormSchema>

export function toFormValues(todo?: Todo): TodoFormValues {
  return {
    title: todo?.title ?? '',
    description: todo?.description ?? '',
    status: todo?.status ?? 'PENDING',
    dueDate: todo?.dueDate?.slice(0, 10) ?? '',
  }
}

export function toRequestBody(values: TodoFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    status: values.status,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
  }
}
