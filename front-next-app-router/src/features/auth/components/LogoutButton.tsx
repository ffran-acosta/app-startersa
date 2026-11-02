import { SubmitButton } from '@/shared/ui/SubmitButton'
import { logout } from '../actions'

export function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton variant="secondary">Salir</SubmitButton>
    </form>
  )
}
