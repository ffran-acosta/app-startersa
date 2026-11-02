'use client'

import { useActionState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { SubmitButton } from '@/shared/ui/SubmitButton'
import { login } from '../actions'

export function LoginForm() {
  const [state, action] = useActionState(login, {})

  return (
    <form noValidate action={action} className="flex flex-col gap-4">
      {state.message && <Alert message={state.message} />}
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
          autoComplete="current-password"
          aria-invalid={!!state.errors?.password}
        />
      </FormField>
      <SubmitButton>Ingresar</SubmitButton>
    </form>
  )
}
