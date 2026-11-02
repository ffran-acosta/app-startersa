import { Injectable } from '@nestjs/common'
import type { DomainEvent } from '../../events/domain-event.js'
import { ProcessedEventsRepository } from '../../events/processed-events.repository.js'
import { RedisService } from '../../events/redis.service.js'
import { StreamConsumer } from '../../events/stream-consumer.js'
import type { Prisma } from '../../generated/prisma/client.js'
import { TodoEvent, type TodoEventPayload } from '../todos/todo-events.js'
import { ActivityRepository } from './activity.repository.js'

const todoEventTypes: string[] = Object.values(TodoEvent)

/** Arma el historial `todo_activity` a partir de los eventos de todos. */
@Injectable()
export class ActivityConsumer extends StreamConsumer {
  protected readonly group = 'activity'

  constructor(
    redis: RedisService,
    processed: ProcessedEventsRepository,
    private readonly activity: ActivityRepository,
  ) {
    super(redis, processed)
  }

  protected async handle(event: DomainEvent, tx: Prisma.TransactionClient) {
    if (!todoEventTypes.includes(event.type)) return
    const { todoId, actorId } = event.payload as TodoEventPayload
    await this.activity.add(tx, {
      type: event.type,
      todoId,
      actorId,
      occurredAt: event.occurredAt,
    })
  }
}
