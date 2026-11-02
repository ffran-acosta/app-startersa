import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type { AuthUser } from '../../../../libs/contracts/index.js'
import { ServicesClient } from '../services.client.js'
import { CurrentUser } from './current-user.decorator.js'
import { LoginDto } from './dto/login.dto.js'
import { RefreshTokenDto } from './dto/refresh-token.dto.js'
import { RegisterDto } from './dto/register.dto.js'
import { Public } from './public.decorator.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly services: ServicesClient) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.services.send('auth.register', dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.services.send('auth.login', dto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.services.send('auth.refresh', dto)
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.services.send('auth.logout', dto)
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.services.send('auth.me', { userId: user.id })
  }
}
