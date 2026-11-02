import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type { Actor } from '../../../shared/domain/actor.js'
import { CurrentUser } from '../../../shared/infrastructure/http/current-user.decorator.js'
import { Public } from '../../../shared/infrastructure/http/public.decorator.js'
import { LoginCommand } from '../../application/commands/login.command.js'
import { LogoutCommand } from '../../application/commands/logout.command.js'
import { RefreshSessionCommand } from '../../application/commands/refresh-session.command.js'
import {
  RegisterUserCommand,
  type AuthSession,
} from '../../application/commands/register-user.command.js'
import { GetUserQuery } from '../../application/queries/get-user.query.js'
import { LoginDto } from './dto/login.dto.js'
import { RefreshTokenDto } from './dto/refresh-token.dto.js'
import { RegisterDto } from './dto/register.dto.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.withUser(
      await this.commandBus.execute(
        new RegisterUserCommand(dto.email, dto.password, dto.name),
      ),
    )
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.withUser(
      await this.commandBus.execute(new LoginCommand(dto.email, dto.password)),
    )
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshSessionCommand(dto.refreshToken))
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new LogoutCommand(dto.refreshToken))
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() actor: Actor) {
    return this.queryBus.execute(new GetUserQuery(actor.id))
  }

  /** Arma el `AuthResponse` del contrato: tokens + usuario del lado de lectura. */
  private async withUser({ userId, ...tokens }: AuthSession) {
    return {
      ...tokens,
      user: await this.queryBus.execute(new GetUserQuery(userId)),
    }
  }
}
