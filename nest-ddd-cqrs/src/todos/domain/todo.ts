import { randomUUID } from 'node:crypto'
import { Role, type Actor } from '../../shared/domain/actor.js'
import { AggregateRoot } from '../../shared/domain/aggregate-root.js'
import { TodoTitle } from './todo-title.js'
import { TodoCompleted, TodoCreated, TodoDeleted } from './todo.events.js'

export enum TodoStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface TodoProps {
  id: string
  title: TodoTitle
  description: string | null
  status: TodoStatus
  dueDate: Date | null
  ownerId: string
}

export interface TodoInput {
  title: string
  description?: string | null
  status?: TodoStatus
  dueDate?: Date | null
}

/** `undefined` no toca el campo; `null` lo borra. */
export type TodoChanges = Partial<TodoInput>

export class Todo extends AggregateRoot {
  private constructor(private readonly props: TodoProps) {
    super()
  }

  static create(input: TodoInput, ownerId: string): Todo {
    const todo = new Todo({
      id: randomUUID(),
      title: TodoTitle.of(input.title),
      description: input.description ?? null,
      status: input.status ?? TodoStatus.PENDING,
      dueDate: input.dueDate ?? null,
      ownerId,
    })
    todo.record(new TodoCreated(todo.id, ownerId))
    return todo
  }

  /** Reconstruye un todo ya persistido, sin emitir eventos. */
  static restore(props: TodoProps): Todo {
    return new Todo(props)
  }

  get id(): string {
    return this.props.id
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  toPrimitives() {
    return { ...this.props, title: this.props.title.value }
  }

  isVisibleTo(actor: Actor): boolean {
    const ownerId = visibleOwnerId(actor)
    return ownerId === undefined || ownerId === this.props.ownerId
  }

  update({ title, description, status, dueDate }: TodoChanges): void {
    if (title !== undefined) this.props.title = TodoTitle.of(title)
    if (description !== undefined) this.props.description = description
    if (dueDate !== undefined) this.props.dueDate = dueDate
    if (status !== undefined && status !== this.props.status) {
      this.props.status = status
      if (status === TodoStatus.DONE) {
        this.record(new TodoCompleted(this.id, this.ownerId))
      }
    }
  }

  delete(): void {
    this.record(new TodoDeleted(this.id, this.ownerId))
  }
}

/**
 * Un `USER` solo ve lo suyo (lo ajeno responde 404); `ADMIN` ve todo.
 * Devuelve el `ownerId` por el que filtrar, o `undefined` para no filtrar.
 */
export function visibleOwnerId(actor: Actor): string | undefined {
  return actor.role === Role.ADMIN ? undefined : actor.id
}
