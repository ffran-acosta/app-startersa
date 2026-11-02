import { QueryClient } from '@tanstack/react-query'
import { isApiError, tokens } from '@/shared/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los errores del contrato (4xx/5xx) no se reintentan; los de red sí.
      retry: (failureCount, error) => !isApiError(error) && failureCount < 2,
    },
  },
})

// Al cerrarse la sesión (logout o refresh fallido) no queda cache del usuario anterior.
tokens.subscribe(() => {
  if (!tokens.getRefreshToken()) queryClient.clear()
})
