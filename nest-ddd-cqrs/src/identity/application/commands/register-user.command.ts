import { Command, CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { ConflictError } from '../../../shared/application/errors.js'
import { Email } from '../../domain/email.js'
import { UserRepository } from '../../domain/user.repository.js'
import { User } from '../../domain/user.js'
import { PasswordHasher } from '../ports.js'
import { TokenIssuer, type TokenPair } from '../token-issuer.js'

/** Tokens emitidos y el usuario autenticado, para leerlo del lado de lectura. */
export type AuthSession = TokenPair & { userId: string }

export class RegisterUserCommand extends Command<AuthSession> {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string,
  ) {
    super()
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthSession> {
    const email = Email.of(command.email)
    if (await this.users.existsByEmail(email)) {
      throw new ConflictError('Email already registered')
    }
    const user = User.register({
      email,
      name: command.name,
      passwordHash: await this.hasher.hash(command.password),
    })
    await this.users.save(user)
    return { ...(await this.tokens.issue(user.actor)), userId: user.actor.id }
  }
}
