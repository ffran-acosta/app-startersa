import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../../../application/auth/get-current-user.js'
import { Login } from '../../../application/auth/login.js'
import { Logout } from '../../../application/auth/logout.js'
import { RefreshSession } from '../../../application/auth/refresh-session.js'
import { Register } from '../../../application/auth/register.js'
import type { Actor } from '../../../domain/user/user.js'
import { CurrentUser } from '../common/current-user.decorator.js'
import { Public } from '../common/public.decorator.js'
import { LoginDto } from './dto/login.dto.js'
import { RefreshTokenDto } from './dto/refresh-token.dto.js'
import { RegisterDto } from './dto/register.dto.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: Register,
    private readonly loginUser: Login,
    private readonly refreshSession: RefreshSession,
    private readonly logoutUser: Logout,
    private readonly getCurrentUser: GetCurrentUser,
  ) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.loginUser.execute(dto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshSession.execute(dto.refreshToken)
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() dto: RefreshTokenDto) {
    return this.logoutUser.execute(dto.refreshToken)
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() actor: Actor) {
    return this.getCurrentUser.execute(actor)
  }
}
