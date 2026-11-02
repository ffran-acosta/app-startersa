'use server'

import { refresh, revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api } from '@/shared/api/client'
import { getErrorMessage } from '@/shared/api/errors'
import { readForm, type FormState } from '@/shared/lib/form'
import { TODO_STATUSES, type TodoStatus } from './types'

const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(200, 'Máximo 200 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres'),
  status: z.enum(TODO_STATUSES),
  /** `YYYY-MM-DD` del input date, o vacío. */
  dueDate: z.iso.date('Fecha inválida').or(z.literal('')),
})

/** Crea si no hay `id`; si hay, edita. */
export async function saveTodo(
  id: string | undefined,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, [
    'title',
    'description',
    'status',
    'dueDate',
  ])

  const parsed = todoSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values }
  }

  const body = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate
      ? new Date(parsed.data.dueDate).toISOString()
      : null,
  }
  const { error } = id
    ? await api.PATCH('/todos/{id}', { params: { path: { id } }, body })
    : await api.POST('/todos', { body })
  if (error) return { message: getErrorMessage(error), values }

  revalidatePath('/todos')
  redirect('/todos')
}

// Completar y borrar no muestran errores: el refresh deja la lista como está en el backend.
export async function setTodoStatus(id: string, status: TodoStatus) {
  await api.PATCH('/todos/{id}', {
    params: { path: { id } },
    body: { status },
  })
  refresh()
}

export async function deleteTodo(id: string) {
  await api.DELETE('/todos/{id}', { params: { path: { id } } })
  refresh()
}
