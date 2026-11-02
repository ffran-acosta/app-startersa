import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type {
  NewRefreshToken,
  RefreshTokenRepository,
} from '../../domain/auth/refresh-token.repository.js'
import { DrizzleService } from './drizzle.service.js'
import { refreshTokens } from './schema.js'

@Injectable()
export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(token: NewRefreshToken): Promise<void> {
    await this.drizzle.db.insert(refreshTokens).values(token)
  }

  async consume(tokenHash: string) {
    const [token] = await this.drizzle.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .returning({
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
      })
    return token ?? null
  }
}
