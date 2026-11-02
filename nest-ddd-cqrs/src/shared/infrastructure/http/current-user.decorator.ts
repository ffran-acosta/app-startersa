import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { Actor } from '../../domain/actor.js'

export type AuthenticatedRequest = Request & { user: Actor }

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Actor =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
)
