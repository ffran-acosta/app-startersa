import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import type { Prisma } from '../generated/prisma/client.js'
import type { DomainEvent } from './domain-event.js'

@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Se llama dentro de la transacción del cambio: o se guardan ambos o ninguno. */
  async add(
    tx: Prisma.TransactionClient,
    type: string,
    payload: Prisma.InputJsonValue,
  ): Promise<void> {
    await tx.outboxEvent.create({
      data: { type, payload },
      select: { id: true },
    })
  }

  /**
   * Toma los eventos sin publicar más viejos, los pasa a `publish` y los marca como publicados.
   * `SKIP LOCKED` permite correr varias instancias sin publicar dos veces el mismo lote.
   */
  publishPending(
    limit: number,
    publish: (events: DomainEvent[]) => Promise<void>,
  ): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        { id: string; type: string; payload: unknown; createdAt: Date }[]
      >`
        SELECT id, type, payload, "createdAt" FROM outbox_events
        WHERE "publishedAt" IS NULL
        ORDER BY "createdAt"
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED`
      if (rows.length === 0) return 0

      await publish(
        rows.map(({ createdAt, ...row }) => ({
          ...row,
          occurredAt: createdAt,
        })),
      )
      await tx.outboxEvent.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { publishedAt: new Date() },
      })
      return rows.length
    })
  }
}
