import { useQueryClient } from '@tanstack/react-query'
import { tokens } from '@/shared/api'
import { meQueryKey, type AuthResponse } from '@/entities/session'

export function useStartSession() {
  const queryClient = useQueryClient()

  return ({ user, ...pair }: AuthResponse) => {
    queryClient.setQueryData(meQueryKey, user)
    tokens.set(pair)
  }
}
