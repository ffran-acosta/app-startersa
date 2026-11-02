import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoKeys } from '@/entities/todo'
import { api } from '@/shared/api'
import { Button } from '@/shared/ui'

export function DeleteTodoButton({ id }: { id: string }) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await api.DELETE('/todos/{id}', {
        params: { path: { id } },
      })
      if (error) throw error
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  })

  return (
    <Button
      variant="danger"
      disabled={remove.isPending}
      onClick={() => {
        if (window.confirm('¿Eliminar este todo?')) remove.mutate()
      }}
    >
      Eliminar
    </Button>
  )
}
