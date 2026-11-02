import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import createClient from 'openapi-fetch'
import { API_URL } from '@/shared/config/env'
import type { paths } from './schema'
import { ACCESS_COOKIE } from './session'

async function authFetch(request: Request): Promise<Response> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value
  if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(request)
  // Token rechazado (otro backend, secreto rotado...): se descarta la sesión.
  if (response.status === 401 && accessToken) redirect('/session-expired')
  return response
}

/** Cliente tipado del contrato. Solo servidor: el token nunca llega al browser. */
export const api = createClient<paths>({ baseUrl: API_URL, fetch: authFetch })
