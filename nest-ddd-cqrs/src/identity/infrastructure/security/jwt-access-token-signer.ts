import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Actor } from '../../../shared/domain/actor.js'
import type { AccessTokenPayload } from '../../../shared/infrastructure/http/jwt-auth.guard.js'
import type { AccessTokenSigner } from '../../application/ports.js'

@Injectable()
export class JwtAccessTokenSigner implements AccessTokenSigner {
  constructor(private readonly jwt: JwtService) {}

  sign(actor: Actor): Promise<string> {
    const payload: AccessTokenPayload = { sub: actor.id, role: actor.role }
    return this.jwt.signAsync(payload)
  }
}
