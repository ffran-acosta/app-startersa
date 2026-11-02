import { Command, CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { UnauthorizedError } from '../../../shared/application/errors.js'
import { RefreshTokenRepository } from '../../domain/refresh-token.repository.js'
import { UserRepository } from '../../domain/user.repository.js'
import {
  hashRefreshToken,
  TokenIssuer,
  type TokenPair,
} from '../token-issuer.js'

/** Consume el refresh token y emite un par nuevo (rotación). */
export class RefreshSessionCommand extends Command<TokenPair> {
  constructor(readonly refreshToken: string) {
    super()
  }
}

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler implements ICommandHandler<RefreshSessionCommand> {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly users: UserRepository,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute({ refreshToken }: RefreshSessionCommand): Promise<TokenPair> {
    const stored = await this.refreshTokens.consume(
      hashRefreshToken(refreshToken),
    )
    const user =
      stored && stored.expiresAt > new Date()
        ? await this.users.findById(stored.userId)
        : null
    if (!user) throw new UnauthorizedError('Invalid or expired refresh token')
    return this.tokens.issue(user.actor)
  }
}
