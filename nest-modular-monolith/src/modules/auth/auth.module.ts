import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import type { Env } from '../../shared/config/env.js'
import { UsersModule } from '../users/index.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'
import { RefreshTokensRepository } from './refresh-tokens.repository.js'

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('ACCESS_TOKEN_TTL', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokensRepository,
    // Global: protege las rutas de todos los módulos salvo las `@Public()`.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
