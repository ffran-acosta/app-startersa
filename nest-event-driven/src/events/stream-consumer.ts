import {
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common'
import { hostname } from 'node:os'
import { setTimeout } from 'node:timers/promises'
import type { Prisma } from '../generated/prisma/client.js'
import {
  EVENTS_STREAM,
  fromStreamFields,
  type DomainEvent,
} from './domain-event.js'
import type { ProcessedEventsRepository } from './processed-events.repository.js'
import type { RedisClient, RedisService } from './redis.service.js'

const BATCH_SIZE = 10
const BLOCK_MS = 5000
/** Mensajes sin ACK por más de esto se vuelven a entregar, a esta u otra instancia. */
const CLAIM_IDLE_MS = 60_000
/** Al superar este número de entregas el evento se descarta con un log de error. */
const MAX_DELIVERIES = 5

/** Entrada de XREADGROUP con CLAIM (node-redis la tipa como `any`). */
type StreamMessage = {
  id: string
  message: Record<string, string>
  deliveriesCounter?: number
}

/**
 * Consumidor de `EVENTS_STREAM` con un consumer group propio (`group`): cada grupo recibe todos
 * los eventos y, dentro del grupo, cada evento va a una sola instancia. El efecto de `handle` se
 * aplica una sola vez aunque el evento llegue repetido (ver `ProcessedEventsRepository.runOnce`).
 */
export abstract class StreamConsumer
  implements OnApplicationBootstrap, OnModuleDestroy
{
  protected abstract readonly group: string

  /** Aplica el efecto del evento usando `tx`; los tipos que no le interesan los ignora. */
  protected abstract handle(
    event: DomainEvent,
    tx: Prisma.TransactionClient,
  ): Promise<void>

  private readonly logger = new Logger(this.constructor.name)
  private readonly consumer = hostname()
  private client?: RedisClient
  private running = false
  private loop?: Promise<void>

  constructor(
    private readonly redis: RedisService,
    private readonly processed: ProcessedEventsRepository,
  ) {}

  async onApplicationBootstrap() {
    // Conexión propia: XREADGROUP con BLOCK la ocupa mientras espera.
    const client = this.redis.client.duplicate()
    client.on('error', (error) => this.logger.error(error))
    await client.connect()
    await this.createGroup(client)

    this.client = client
    this.running = true
    this.loop = this.run(client)
  }

  async onModuleDestroy() {
    this.running = false
    this.client?.destroy()
    await this.loop
  }

  private async createGroup(client: RedisClient) {
    try {
      // '0': un grupo nuevo arranca desde el principio del stream.
      await client.xGroupCreate(EVENTS_STREAM, this.group, '0', {
        MKSTREAM: true,
      })
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith('BUSYGROUP'))) {
        throw error
      }
    }
  }

  private async run(client: RedisClient) {
    while (this.running) {
      try {
        const reply = await client.xReadGroup(
          this.group,
          this.consumer,
          { key: EVENTS_STREAM, id: '>' },
          { COUNT: BATCH_SIZE, BLOCK: BLOCK_MS, CLAIM: CLAIM_IDLE_MS },
        )
        const messages = (reply?.[0]?.messages ?? []) as StreamMessage[]
        for (const message of messages) {
          await this.process(client, message)
        }
      } catch (error) {
        if (!this.running) return
        this.logger.error(error)
        await setTimeout(1000)
      }
    }
  }

  private async process(client: RedisClient, message: StreamMessage) {
    const event = fromStreamFields(message.message)
    if ((message.deliveriesCounter ?? 0) > MAX_DELIVERIES) {
      this.logger.error(
        `Discarding event ${event.id} (${event.type}) after ${MAX_DELIVERIES} deliveries`,
      )
    } else {
      try {
        await this.processed.runOnce(this.group, event.id, (tx) =>
          this.handle(event, tx),
        )
      } catch (error) {
        // Sin ACK: queda pendiente y se reintenta después de CLAIM_IDLE_MS.
        this.logger.error(`Event ${event.id} (${event.type}) failed`, error)
        return
      }
    }
    await client.xAck(EVENTS_STREAM, this.group, message.id)
  }
}
