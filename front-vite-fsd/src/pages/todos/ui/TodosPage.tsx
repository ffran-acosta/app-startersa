import { Link } from 'react-router'
import { TodoItem, useTodos } from '@/entities/todo'
import { DeleteTodoButton } from '@/features/todo-delete'
import { TodoFilters, useTodoFilters } from '@/features/todo-filters'
import { ToggleTodoStatus } from '@/features/todo-toggle-status'
import { getErrorMessage } from '@/shared/api'
import { Alert, Pagination } from '@/shared/ui'

export function TodosPage() {
  const { params, setFilters } = useTodoFilters()
  const { data, isPending, error } = useTodos(params)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis todos</h1>
        <Link
          to="/todos/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo
        </Link>
      </div>

      <TodoFilters value={params} onChange={setFilters} />

      {isPending && <p className="text-sm text-slate-500">Cargando…</p>}
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
                      to={`/todos/${todo.id}/edit`}
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
            onChange={(page) => setFilters({ page })}
          />
        </>
      )}
    </section>
  )
}
