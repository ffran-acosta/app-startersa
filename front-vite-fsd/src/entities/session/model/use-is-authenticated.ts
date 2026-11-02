import { useSyncExternalStore } from 'react'
import { tokens } from '@/shared/api'

export function useIsAuthenticated() {
  return useSyncExternalStore(
    tokens.subscribe,
    () => tokens.getRefreshToken() !== null,
  )
}
