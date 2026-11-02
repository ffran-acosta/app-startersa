import Link from 'next/link'
import { Suspense } from 'react'
import { DeleteTodoButton } from '@/features/todos/components/DeleteTodoButton'
import { TodoFilters } from '@/features/todos/components/TodoFilters'
import { TodoItem } from '@/features/todos/components/TodoItem'
import { ToggleTodoStatus } from '@/features/todos/components/ToggleTodoStatus'
import { parseTodoFilters, todosHref } from '@/features/todos/filters'
import { listTodos } from '@/features/todos/queries'
import { getErrorMessage } from '@/shared/api/errors'
import { Alert } from '@/shared/ui/Alert'
import { Pagination } from '@/shared/ui/Pagination'

export default function TodosPage({ searchParams }: PageProps<'/todos'>) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis todos</h1>
        <Link
          href="/todos/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-slate-500">Cargando…</p>}>
        <TodoList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

async function TodoList({
  searchParams,
}: Pick<PageProps<'/todos'>, 'searchParams'>) {
  const params = parseTodoFilters(await searchParams)
  const { data, error } = await listTodos(params)

  return (
    <>
      <TodoFilters value={params} />

      {error && <Alert message={getErrorMessage(error)} />}
      {data?.data.length === 0 && (
        <p className="text-sm text-slate-500">No hay todos para mostrar.</p>
      )}

      {data && data.data.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {data.data.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                actions={
                  <>
                    <ToggleTodoStatus todo={todo} />
                    <Link
                      href={`/todos/${todo.id}/edit`}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      Editar
                    </Link>
                    <DeleteTodoButton id={todo.id} />
                  </>
                }
              />
            ))}
          </ul>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            href={(page) => todosHref({ ...params, page })}
          />
        </>
      )}
    </>
  )
}
