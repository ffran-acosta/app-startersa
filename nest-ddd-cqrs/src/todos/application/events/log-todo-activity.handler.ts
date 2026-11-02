import { Logger } from '@nestjs/common'
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs'
import {
  TodoCompleted,
  TodoCreated,
  TodoDeleted,
} from '../../domain/todo.events.js'

type TodoEvent = TodoCreated | TodoCompleted | TodoDeleted

/**
 * Ejemplo de reacción a eventos de dominio. Acá van los efectos secundarios
 * (notificar, auditar, actualizar otro contexto) sin tocar los comandos.
 */
@EventsHandler(TodoCreated, TodoCompleted, TodoDeleted)
export class LogTodoActivityHandler implements IEventHandler<TodoEvent> {
  private readonly logger = new Logger('TodoActivity')

  handle(event: TodoEvent): void {
    this.logger.log(
      `${event.constructor.name} todo=${event.todoId} owner=${event.ownerId}`,
    )
  }
}
