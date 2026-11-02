import { Navigate, Outlet } from 'react-router'
import { useIsAuthenticated } from '@/entities/session'

export function RequireAuth() {
  return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

export function RequireGuest() {
  return useIsAuthenticated() ? <Navigate to="/todos" replace /> : <Outlet />
}
