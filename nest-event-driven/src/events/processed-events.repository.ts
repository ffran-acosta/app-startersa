import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import type { Prisma } from '../generated/prisma/client.js'

@Injectable()
export class ProcessedEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Corre `handler` solo si `consumer` no procesó antes `eventId`. La marca y el efecto van en la
   * misma transacción: si el handler falla no queda marcado; si dos instancias reciben el mismo
   * evento, la PK hace que la segunda espere y lo saltee.
   */
  async runOnce(
    consumer: string,
    eventId: string,
    handler: (tx: Prisma.TransactionClient) => Promise<void>,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.processedEvent.createMany({
        data: { eventId, consumer },
        skipDuplicates: true,
      })
      if (count > 0) await handler(tx)
    })
  }
}
