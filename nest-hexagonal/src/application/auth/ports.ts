import type { Actor } from '../../domain/user/user.js'

export abstract class PasswordHasher {
  abstract hash(password: string): Promise<string>
  abstract verify(password: string, hash: string): Promise<boolean>
}

export abstract class AccessTokenSigner {
  abstract sign(actor: Actor): Promise<string>
}
