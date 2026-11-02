import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import type {
  MessagePayload,
  MessageResult,
  Pattern,
} from '../../../libs/contracts/index.js'
import { AuthService } from './auth.service.js'

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @MessagePattern('auth.register' satisfies Pattern)
  register(
    @Payload() data: MessagePayload<'auth.register'>,
  ): Promise<MessageResult<'auth.register'>> {
    return this.auth.register(data)
  }

  @MessagePattern('auth.login' satisfies Pattern)
  login(
    @Payload() credentials: MessagePayload<'auth.login'>,
  ): Promise<MessageResult<'auth.login'>> {
    return this.auth.login(credentials)
  }

  @MessagePattern('auth.refresh' satisfies Pattern)
  refresh(
    @Payload() { refreshToken }: MessagePayload<'auth.refresh'>,
  ): Promise<MessageResult<'auth.refresh'>> {
    return this.auth.refresh(refreshToken)
  }

  @MessagePattern('auth.logout' satisfies Pattern)
  async logout(
    @Payload() { refreshToken }: MessagePayload<'auth.logout'>,
  ): Promise<MessageResult<'auth.logout'>> {
    await this.auth.logout(refreshToken)
    return null
  }

  @MessagePattern('auth.me' satisfies Pattern)
  me(
    @Payload() { userId }: MessagePayload<'auth.me'>,
  ): Promise<MessageResult<'auth.me'>> {
    return this.auth.me(userId)
  }
}
