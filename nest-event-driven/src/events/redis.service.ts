import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from 'redis'
import type { Env } from '../config/env.js'

export type RedisClient = ReturnType<typeof createClient>

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name)
  readonly client: RedisClient

  constructor(config: ConfigService<Env, true>) {
    this.client = createClient({
      url: config.get('REDIS_URL', { infer: true }),
    })
    this.client.on('error', (error) => this.logger.error(error))
  }

  async onModuleInit() {
    await this.client.connect()
  }

  // Se cierra al final, después de que el relay y los consumidores frenen en onModuleDestroy.
  async onApplicationShutdown() {
    await this.client.close()
  }
}
