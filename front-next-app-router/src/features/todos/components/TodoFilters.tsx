import Form from 'next/form'
import { Button } from '@/shared/ui/Button'
import { Input, Select } from '@/shared/ui/Input'
import { TODO_STATUS_LABEL, TODO_STATUSES, type TodoListParams } from '../types'

/** GET a `/todos`: los filtros quedan en la URL y la página vuelve a 1. */
export function TodoFilters({ value }: { value: TodoListParams }) {
  return (
    <Form action="/todos" className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="search"
        type="search"
        placeholder="Buscar por título o descripción"
        maxLength={100}
        defaultValue={value.search}
      />
      <div className="flex gap-2">
        <div className="sm:w-48">
          <Select
            name="status"
            aria-label="Estado"
            defaultValue={value.status ?? ''}
          >
            <option value="">Todos los estados</option>
            {TODO_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TODO_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </div>
    </Form>
  )
}
