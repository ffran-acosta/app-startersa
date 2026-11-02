'use client'

import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from './Button'

export function SubmitButton({
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, 'type'>) {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending || disabled} {...props} />
}
