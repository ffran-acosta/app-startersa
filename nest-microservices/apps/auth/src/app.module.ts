import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { envValidator } from '../../../libs/config/validate-env.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { Env } from './env.js'
import { PrismaService } from './prisma.service.js'
import { RefreshTokensRepository } from './refresh-tokens.repository.js'
import { UsersRepository } from './users.repository.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envValidator(Env) }),
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
    PrismaService,
    AuthService,
    UsersRepository,
    RefreshTokensRepository,
  ],
})
export class AppModule {}
