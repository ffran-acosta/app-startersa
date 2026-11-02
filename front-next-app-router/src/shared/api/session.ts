import type { cookies } from 'next/headers'
import createClient from 'openapi-fetch'
import { API_URL } from '@/shared/config/env'
import type { components, paths } from './schema'

type TokenPair = components['schemas']['TokenPair']
type CookieWriter = Pick<Awaited<ReturnType<typeof cookies>>, 'set' | 'delete'>

export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'

/** El contrato no informa la vida del refresh; coincide con el default de los backends. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7
/** El access se descarta un poco antes de vencer para no mandar un token expirado. */
const ACCESS_EXPIRY_MARGIN = 30

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
} as const

export function writeSession(store: CookieWriter, pair: TokenPair) {
  store.set(ACCESS_COOKIE, pair.accessToken, {
    ...cookieOptions,
    maxAge: Math.max(pair.expiresIn - ACCESS_EXPIRY_MARGIN, 1),
  })
  store.set(REFRESH_COOKIE, pair.refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE,
  })
}

export function clearSession(store: CookieWriter) {
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

const rawApi = createClient<paths>({ baseUrl: API_URL })
const recentRefreshes = new Map<string, Promise<TokenPair | null>>()

/**
 * El backend rota el refresh token: dos renovaciones con el mismo token cierran la sesión.
 * Los requests paralelos que llegan con la cookie vieja (prefetch, navegación) comparten
 * el resultado durante unos segundos. Alcanza con una sola instancia del server.
 */
export function refreshTokens(refreshToken: string) {
  let pending = recentRefreshes.get(refreshToken)
  if (!pending) {
    pending = rawApi
      .POST('/auth/refresh', { body: { refreshToken } })
      .then(({ data }) => data ?? null)
    recentRefreshes.set(refreshToken, pending)
    setTimeout(() => recentRefreshes.delete(refreshToken), 10_000)
  }
  return pending
}
