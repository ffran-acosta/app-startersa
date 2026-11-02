import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api, getErrorMessage } from '@/shared/api'
import { Alert, Button, FormField, Input } from '@/shared/ui'
import { useStartSession } from '../model/use-start-session'

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

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const startSession = useStartSession()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const signUp = useMutation({
    mutationFn: async (body: RegisterValues) => {
      const { data, error } = await api.POST('/auth/register', { body })
      if (error) throw error
      return data
    },
    onSuccess: startSession,
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => signUp.mutate(values))}
    >
      {signUp.isError && <Alert message={getErrorMessage(signUp.error)} />}
      <FormField label="Nombre" error={errors.name?.message}>
        <Input
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </FormField>
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
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" disabled={signUp.isPending}>
        Crear cuenta
      </Button>
    </form>
  )
}
