import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Env } from './env.js'
import { PrismaClient } from './generated/prisma/client.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('AUTH_DATABASE_URL', { infer: true }),
      }),
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
