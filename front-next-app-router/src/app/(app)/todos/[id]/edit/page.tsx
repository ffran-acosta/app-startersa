import { Suspense } from 'react'
import { TodoForm } from '@/features/todos/components/TodoForm'
import { getTodo } from '@/features/todos/queries'
import { getErrorMessage } from '@/shared/api/errors'
import { Alert } from '@/shared/ui/Alert'

export default function EditTodoPage({
  params,
}: PageProps<'/todos/[id]/edit'>) {
  return (
    <section className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar todo</h1>
      <Suspense fallback={<p className="text-sm text-slate-500">Cargando…</p>}>
        <EditTodo params={params} />
      </Suspense>
    </section>
  )
}

async function EditTodo({
  params,
}: Pick<PageProps<'/todos/[id]/edit'>, 'params'>) {
  const { id } = await params
  const { data, error } = await getTodo(id)

  if (error) return <Alert message={getErrorMessage(error)} />
  return <TodoForm todo={data} />
}
