import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api, getErrorMessage } from '@/shared/api'
import { Alert, Button, FormField, Input } from '@/shared/ui'
import { useStartSession } from '../model/use-start-session'

const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const startSession = useStartSession()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const login = useMutation({
    mutationFn: async (body: LoginValues) => {
      const { data, error } = await api.POST('/auth/login', { body })
      if (error) throw error
      return data
    },
    onSuccess: startSession,
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => login.mutate(values))}
    >
      {login.isError && <Alert message={getErrorMessage(login.error)} />}
      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>
      <FormField label="Contraseña" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" disabled={login.isPending}>
        Ingresar
      </Button>
    </form>
  )
}
