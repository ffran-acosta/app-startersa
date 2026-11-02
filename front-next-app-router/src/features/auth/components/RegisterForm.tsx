'use client'

import { useActionState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { SubmitButton } from '@/shared/ui/SubmitButton'
import { register } from '../actions'

export function RegisterForm() {
  const [state, action] = useActionState(register, {})

  return (
    <form noValidate action={action} className="flex flex-col gap-4">
      {state.message && <Alert message={state.message} />}
      <FormField label="Nombre" error={state.errors?.name?.[0]}>
        <Input
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
          aria-invalid={!!state.errors?.name}
        />
      </FormField>
      <FormField label="Email" error={state.errors?.email?.[0]}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={!!state.errors?.email}
        />
      </FormField>
      <FormField label="Contraseña" error={state.errors?.password?.[0]}>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!state.errors?.password}
        />
      </FormField>
      <SubmitButton>Crear cuenta</SubmitButton>
    </form>
  )
}
