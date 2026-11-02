import type { RefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import { hashRefreshToken } from './token-issuer.js'

/** Idempotente: un token desconocido o ya usado no es error. */
export class Logout {
  constructor(private readonly refreshTokens: RefreshTokenRepository) {}

  async execute(refreshToken: string): Promise<void> {
    await this.refreshTokens.consume(hashRefreshToken(refreshToken))
  }
}
