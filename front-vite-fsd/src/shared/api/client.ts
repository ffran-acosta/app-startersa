import createClient from 'openapi-fetch'
import { API_URL } from '@/shared/config'
import type { paths } from './schema'
import { tokens } from './tokens'

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/logout']

// Cliente sin interceptor: el refresh no debe dispararse a sí mismo.
const rawApi = createClient<paths>({ baseUrl: API_URL })

let refreshing: Promise<boolean> | null = null

/** Una sola renovación en vuelo: con rotación, dos refresh paralelos invalidarían la sesión. */
function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = tokens.getRefreshToken()
    if (!refreshToken) return false
    const { data } = await rawApi.POST('/auth/refresh', {
      body: { refreshToken },
    })
    if (!data) {
      tokens.clear()
      return false
    }
    tokens.set(data)
    return true
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

function withAuth(request: Request): Request {
  const accessToken = tokens.getAccessToken()
  if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)
  return request
}

async function authFetch(request: Request): Promise<Response> {
  const retry = request.clone()
  const response = await fetch(withAuth(request))

  const isPublic = PUBLIC_AUTH_PATHS.some((path) =>
    new URL(request.url).pathname.endsWith(path),
  )
  if (response.status !== 401 || isPublic || !tokens.getRefreshToken()) {
    return response
  }

  return (await refreshSession()) ? fetch(withAuth(retry)) : response
}

export const api = createClient<paths>({ baseUrl: API_URL, fetch: authFetch })
