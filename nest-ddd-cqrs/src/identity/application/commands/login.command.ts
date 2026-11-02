import { Command, CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { UnauthorizedError } from '../../../shared/application/errors.js'
import { Email } from '../../domain/email.js'
import { UserRepository } from '../../domain/user.repository.js'
import { PasswordHasher } from '../ports.js'
import { TokenIssuer } from '../token-issuer.js'
import type { AuthSession } from './register-user.command.js'

export class LoginCommand extends Command<AuthSession> {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super()
  }
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute({ email, password }: LoginCommand): Promise<AuthSession> {
    const user = await this.users.findByEmail(Email.of(email))
    if (!user || !(await this.hasher.verify(password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid credentials')
    }
    return { ...(await this.tokens.issue(user.actor)), userId: user.actor.id }
  }
}
