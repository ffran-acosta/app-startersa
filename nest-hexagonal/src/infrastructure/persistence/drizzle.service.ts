import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { Env } from '../config/env.js'

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool
  readonly db: NodePgDatabase

  constructor(config: ConfigService<Env, true>) {
    this.pool = new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    })
    this.db = drizzle({ client: this.pool, casing: 'snake_case' })
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}
