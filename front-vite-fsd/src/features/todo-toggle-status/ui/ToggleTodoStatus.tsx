import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoKeys, type Todo } from '@/entities/todo'
import { api } from '@/shared/api'
import { Button } from '@/shared/ui'

export function ToggleTodoStatus({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient()
  const done = todo.status === 'DONE'

  const toggle = useMutation({
    mutationFn: async () => {
      const { error } = await api.PATCH('/todos/{id}', {
        params: { path: { id: todo.id } },
        body: { status: done ? 'PENDING' : 'DONE' },
      })
      if (error) throw error
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  })

  return (
    <Button
      variant="secondary"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate()}
    >
      {done ? 'Reabrir' : 'Completar'}
    </Button>
  )
}
