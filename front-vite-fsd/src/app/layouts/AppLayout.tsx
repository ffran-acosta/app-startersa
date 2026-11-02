import { Link, Outlet } from 'react-router'
import { useMe } from '@/entities/session'
import { LogoutButton } from '@/features/auth'

export function AppLayout() {
  const { data: me } = useMe()

  return (
    <div className="min-h-svh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/todos" className="font-semibold">
            Todos
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {me && <span className="text-slate-600">{me.name}</span>}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
