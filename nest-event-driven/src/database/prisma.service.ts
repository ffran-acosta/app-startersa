import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Env } from '../config/env.js'
import { PrismaClient } from '../generated/prisma/client.js'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL', { infer: true }),
      }),
    })
  }

  // Al final: el relay y los consumidores la usan hasta frenar en onModuleDestroy.
  async onApplicationShutdown() {
    await this.$disconnect()
  }
}
