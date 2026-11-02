import { NextResponse, type NextRequest } from 'next/server'
import {
  ACCESS_COOKIE,
  clearSession,
  REFRESH_COOKIE,
  refreshTokens,
  writeSession,
} from '@/shared/api/session'

const GUEST_ROUTES = ['/login', '/register']

/**
 * Renueva el access token vencido con el refresh de la cookie y redirige según haya
 * sesión. Los Server Components no pueden escribir cookies, por eso se hace acá.
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const renewed =
    !request.cookies.has(ACCESS_COOKIE) && refreshToken
      ? await refreshTokens(refreshToken)
      : null

  // El render de este request lee las cookies nuevas.
  if (renewed) {
    request.cookies.set(ACCESS_COOKIE, renewed.accessToken)
    request.cookies.set(REFRESH_COOKIE, renewed.refreshToken)
  }

  const authenticated = request.cookies.has(ACCESS_COOKIE)
  const { pathname } = request.nextUrl
  const isGuestRoute = GUEST_ROUTES.includes(pathname)

  const response =
    authenticated && (isGuestRoute || pathname === '/')
      ? NextResponse.redirect(new URL('/todos', request.url))
      : !authenticated && !isGuestRoute
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next({ request })

  if (renewed) writeSession(response.cookies, renewed)
  else if (refreshToken && !authenticated) clearSession(response.cookies)
  return response
}

export const config = {
  matcher: ['/', '/login', '/register', '/todos/:path*'],
}
