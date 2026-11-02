import Link from 'next/link'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <LoginForm />
      <p className="text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="font-medium underline">
          Registrate
        </Link>
      </p>
    </main>
  )
}
