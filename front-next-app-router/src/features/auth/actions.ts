'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api } from '@/shared/api/client'
import { getErrorMessage } from '@/shared/api/errors'
import {
  clearSession,
  REFRESH_COOKIE,
  writeSession,
} from '@/shared/api/session'
import { readForm, type FormState } from '@/shared/lib/form'

const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresá tu nombre')
    .max(100, 'Máximo 100 caracteres'),
  email: z.email('Email inválido').max(254, 'Máximo 254 caracteres'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(72, 'Máximo 72 caracteres'),
})

export async function login(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const form = readForm(formData, ['email', 'password'])
  const values = { email: form.email }

  const parsed = loginSchema.safeParse(form)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values }
  }

  const { data, error } = await api.POST('/auth/login', { body: parsed.data })
  if (error) return { message: getErrorMessage(error), values }

  writeSession(await cookies(), data)
  redirect('/todos')
}

export async function register(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const form = readForm(formData, ['name', 'email', 'password'])
  const values = { name: form.name, email: form.email }

  const parsed = registerSchema.safeParse(form)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values }
  }

  const { data, error } = await api.POST('/auth/register', {
    body: parsed.data,
  })
  if (error) return { message: getErrorMessage(error), values }

  writeSession(await cookies(), data)
  redirect('/todos')
}

export async function logout() {
  const store = await cookies()
  const refreshToken = store.get(REFRESH_COOKIE)?.value
  if (refreshToken) {
    // La sesión local se cierra aunque el backend no responda.
    await api
      .POST('/auth/logout', { body: { refreshToken } })
      .catch(() => undefined)
  }
  clearSession(store)
  redirect('/login')
}
