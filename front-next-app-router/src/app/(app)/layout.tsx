import Link from 'next/link'
import { Suspense } from 'react'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { UserName } from '@/features/auth/components/UserName'

/** Las rutas de este grupo requieren sesión; `proxy.ts` redirige a `/login` si no hay. */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/todos" className="font-semibold">
            Todos
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Suspense>
              <UserName />
            </Suspense>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
