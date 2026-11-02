import { TODO_STATUS_LABEL, TODO_STATUSES } from '@/entities/todo'
import { Button, Input, Select } from '@/shared/ui'
import { parseStatus, type TodoFiltersValue } from '../model/use-todo-filters'

type TodoFiltersProps = {
  value: TodoFiltersValue
  onChange: (next: TodoFiltersValue) => void
}

export function TodoFilters({ value, onChange }: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const search = new FormData(event.currentTarget).get('search')
          onChange({ search: String(search).trim() || undefined })
        }}
      >
        <Input
          name="search"
          type="search"
          placeholder="Buscar por título o descripción"
          maxLength={100}
          defaultValue={value.search}
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>
      <div className="sm:w-48">
        <Select
          aria-label="Estado"
          value={value.status ?? ''}
          onChange={(event) =>
            onChange({ status: parseStatus(event.target.value) })
          }
        >
          <option value="">Todos los estados</option>
          {TODO_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TODO_STATUS_LABEL[status]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
