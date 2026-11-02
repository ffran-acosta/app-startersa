import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common'
import { setTimeout } from 'node:timers/promises'
import {
  EVENTS_STREAM,
  toStreamFields,
  type DomainEvent,
} from './domain-event.js'
import { OutboxRepository } from './outbox.repository.js'
import { RedisService } from './redis.service.js'

const BATCH_SIZE = 100
const POLL_INTERVAL_MS = 1000
/** Tope aproximado del stream para que no crezca sin límite. */
const STREAM_MAX_LENGTH = 100_000

/**
 * Publica en Redis los eventos del outbox. Si Redis falla, el lote queda sin marcar y se reintenta;
 * si la marca falla después de publicar, el lote sale de nuevo: la entrega es at-least-once.
 */
@Injectable()
export class OutboxRelay implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name)
  private running = false
  private loop?: Promise<void>

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly redis: RedisService,
  ) {}

  onApplicationBootstrap() {
    this.running = true
    this.loop = this.run()
  }

  async onModuleDestroy() {
    this.running = false
    await this.loop
  }

  private async run() {
    while (this.running) {
      try {
        const published = await this.outbox.publishPending(
          BATCH_SIZE,
          (events) => this.publish(events),
        )
        if (published < BATCH_SIZE) await setTimeout(POLL_INTERVAL_MS)
      } catch (error) {
        this.logger.error(error)
        await setTimeout(POLL_INTERVAL_MS)
      }
    }
  }

  private async publish(events: DomainEvent[]) {
    const multi = this.redis.client.multi()
    for (const event of events) {
      multi.xAdd(EVENTS_STREAM, '*', toStreamFields(event), {
        TRIM: {
          strategy: 'MAXLEN',
          strategyModifier: '~',
          threshold: STREAM_MAX_LENGTH,
        },
      })
    }
    await multi.exec()
  }
}
