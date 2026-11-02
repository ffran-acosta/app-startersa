import { TodoForm } from '@/features/todos/components/TodoForm'

export default function NewTodoPage() {
  return (
    <section className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Nuevo todo</h1>
      <TodoForm />
    </section>
  )
}
