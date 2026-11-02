import { Link } from 'react-router'
import { RegisterForm } from '@/features/auth'

export function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <RegisterForm />
      <p className="text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium underline">
          Iniciá sesión
        </Link>
      </p>
    </main>
  )
}
