import type { RefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import type { UserRepository } from '../../domain/user/user.repository.js'
import { UnauthorizedError } from '../errors.js'
import {
  hashRefreshToken,
  type TokenIssuer,
  type TokenPair,
} from './token-issuer.js'

/** Consume el refresh token y emite un par nuevo (rotación). */
export class RefreshSession {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly users: UserRepository,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const stored = await this.refreshTokens.consume(
      hashRefreshToken(refreshToken),
    )
    const user =
      stored && stored.expiresAt > new Date()
        ? await this.users.findById(stored.userId)
        : null
    if (!user) throw new UnauthorizedError('Invalid or expired refresh token')
    return this.tokens.issue(user)
  }
}
