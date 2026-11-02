/** Stream de Redis donde el relay publica todos los eventos del outbox. */
export const EVENTS_STREAM = 'events'

export interface DomainEvent {
  /** Id de la fila del outbox; los consumidores lo usan para deduplicar. */
  id: string
  type: string
  payload: unknown
  occurredAt: Date
}

export function toStreamFields(event: DomainEvent): Record<string, string> {
  return {
    id: event.id,
    type: event.type,
    payload: JSON.stringify(event.payload),
    occurredAt: event.occurredAt.toISOString(),
  }
}

export function fromStreamFields(fields: Record<string, string>): DomainEvent {
  return {
    id: fields.id,
    type: fields.type,
    payload: JSON.parse(fields.payload),
    occurredAt: new Date(fields.occurredAt),
  }
}
