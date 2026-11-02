import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

export const meQueryKey = ['session', 'me'] as const

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      const { data, error } = await api.GET('/auth/me')
      if (error) throw error
      return data
    },
  })
}
