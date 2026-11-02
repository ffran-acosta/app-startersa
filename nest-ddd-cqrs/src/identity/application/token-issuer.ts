import { createHash, randomBytes } from 'node:crypto'
import type { RefreshTokenRepository } from '../domain/refresh-token.repository.js'
import type { Actor } from '../../shared/domain/actor.js'
import type { AccessTokenSigner } from './ports.js'

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/** Vidas en segundos. */
export interface TokenTtl {
  access: number
  refresh: number
}

/** Refresh token opaco; en la DB solo se guarda su hash SHA-256. */
export class TokenIssuer {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly signer: AccessTokenSigner,
    private readonly ttl: TokenTtl,
  ) {}

  async issue(actor: Actor): Promise<TokenPair> {
    const refreshToken = randomBytes(32).toString('base64url')
    await this.refreshTokens.create({
      tokenHash: hashRefreshToken(refreshToken),
      userId: actor.id,
      expiresAt: new Date(Date.now() + this.ttl.refresh * 1000),
    })
    return {
      accessToken: await this.signer.sign(actor),
      refreshToken,
      expiresIn: this.ttl.access,
    }
  }
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
