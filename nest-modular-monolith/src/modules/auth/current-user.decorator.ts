import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { Role } from '../users/index.js'

export interface AuthUser {
  id: string
  role: Role
}

export type AuthenticatedRequest = Request & { user: AuthUser }

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
)
