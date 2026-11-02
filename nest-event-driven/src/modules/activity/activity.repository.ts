import { Injectable } from '@nestjs/common'
import type { Prisma } from '../../generated/prisma/client.js'

@Injectable()
export class ActivityRepository {
  async add(
    tx: Prisma.TransactionClient,
    data: Prisma.TodoActivityCreateInput,
  ): Promise<void> {
    await tx.todoActivity.create({ data, select: { id: true } })
  }
}
