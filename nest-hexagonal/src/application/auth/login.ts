import type { UserRepository } from '../../domain/user/user.repository.js'
import { UnauthorizedError } from '../errors.js'
import type { PasswordHasher } from './ports.js'
import type { AuthResult } from './register.js'
import type { TokenIssuer } from './token-issuer.js'

export interface LoginInput {
  email: string
  password: string
}

export class Login {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const found = await this.users.findByEmailWithPassword(input.email)
    if (
      !found ||
      !(await this.hasher.verify(input.password, found.passwordHash))
    ) {
      throw new UnauthorizedError('Invalid credentials')
    }
    const { passwordHash, ...user } = found
    return { ...(await this.tokens.issue(user)), user }
  }
}
