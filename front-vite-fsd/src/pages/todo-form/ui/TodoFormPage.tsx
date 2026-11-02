import { useNavigate, useParams } from 'react-router'
import { useTodo } from '@/entities/todo'
import { TodoForm } from '@/features/todo-upsert'
import { getErrorMessage } from '@/shared/api'
import { Alert } from '@/shared/ui'

/** Alta en `/todos/new`, edición en `/todos/:id/edit`. */
export function TodoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const goToList = () => navigate('/todos')

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        {id ? 'Editar todo' : 'Nuevo todo'}
      </h1>
      {id ? (
        <EditTodo id={id} onSuccess={goToList} />
      ) : (
        <TodoForm onSuccess={goToList} />
      )}
    </section>
  )
}

function EditTodo({ id, onSuccess }: { id: string; onSuccess: () => void }) {
  const { data, isPending, error } = useTodo(id)

  if (isPending) return <p className="text-sm text-slate-500">Cargando…</p>
  if (error) return <Alert message={getErrorMessage(error)} />
  return <TodoForm todo={data} onSuccess={onSuccess} />
}
