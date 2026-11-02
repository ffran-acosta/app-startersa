import { NextResponse, type NextRequest } from 'next/server'
import { clearSession } from '@/shared/api/session'

/** Destino del cliente de la API cuando el backend rechaza el token: borra las cookies. */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  clearSession(response.cookies)
  return response
}
