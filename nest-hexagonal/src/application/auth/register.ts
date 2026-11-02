import type { UserRepository } from '../../domain/user/user.repository.js'
import type { User } from '../../domain/user/user.js'
import { ConflictError } from '../errors.js'
import type { PasswordHasher } from './ports.js'
import type { TokenIssuer, TokenPair } from './token-issuer.js'

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export type AuthResult = TokenPair & { user: User }

export class Register {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    if (await this.users.existsByEmail(input.email)) {
      throw new ConflictError('Email already registered')
    }
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash: await this.hasher.hash(input.password),
    })
    return { ...(await this.tokens.issue(user)), user }
  }
}
