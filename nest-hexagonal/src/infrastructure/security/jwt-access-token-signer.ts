import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AccessTokenSigner } from '../../application/auth/ports.js'
import type { Actor, Role } from '../../domain/user/user.js'

export interface AccessTokenPayload {
  sub: string
  role: Role
}

@Injectable()
export class JwtAccessTokenSigner implements AccessTokenSigner {
  constructor(private readonly jwt: JwtService) {}

  sign(actor: Actor): Promise<string> {
    const payload: AccessTokenPayload = { sub: actor.id, role: actor.role }
    return this.jwt.signAsync(payload)
  }
}
