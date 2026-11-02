import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthUser } from '../../../../libs/contracts/index.js'

export type AuthenticatedRequest = Request & { user: AuthUser }

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
)
