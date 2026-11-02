import { useMutation } from '@tanstack/react-query'
import { api, tokens } from '@/shared/api'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const logout = useMutation({
    mutationFn: async () => {
      const refreshToken = tokens.getRefreshToken()
      if (refreshToken) {
        await api.POST('/auth/logout', { body: { refreshToken } })
      }
    },
    // La sesión local se cierra aunque el backend no responda.
    onSettled: () => tokens.clear(),
  })

  return (
    <Button
      variant="secondary"
      disabled={logout.isPending}
      onClick={() => logout.mutate()}
    >
      Salir
    </Button>
  )
}
