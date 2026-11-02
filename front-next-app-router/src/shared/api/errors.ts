import type { components } from './schema'

export type ApiError = components['schemas']['Error']

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  )
}

export function getErrorMessage(error: unknown): string {
  return isApiError(error)
    ? error.message
    : 'Ocurrió un error inesperado. Intentá de nuevo.'
}
