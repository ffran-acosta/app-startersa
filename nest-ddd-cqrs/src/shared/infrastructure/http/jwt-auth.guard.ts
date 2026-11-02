import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import type { Role } from '../../domain/actor.js'
import type { AuthenticatedRequest } from './current-user.decorator.js'
import { IS_PUBLIC_KEY } from './public.decorator.js'

export interface AccessTokenPayload {
  sub: string
  role: Role
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token')
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token)
      request.user = { id: payload.sub, role: payload.role }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
    return true
  }
}
