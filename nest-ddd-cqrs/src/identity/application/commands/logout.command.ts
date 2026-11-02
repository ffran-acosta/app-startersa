import { Command, CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { RefreshTokenRepository } from '../../domain/refresh-token.repository.js'
import { hashRefreshToken } from '../token-issuer.js'

/** Idempotente: un token desconocido o ya usado no es error. */
export class LogoutCommand extends Command<void> {
  constructor(readonly refreshToken: string) {
    super()
  }
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly refreshTokens: RefreshTokenRepository) {}

  async execute({ refreshToken }: LogoutCommand): Promise<void> {
    await this.refreshTokens.consume(hashRefreshToken(refreshToken))
  }
}
