import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import type { Env } from '../shared/infrastructure/config/env.js'
import { LoginHandler } from './application/commands/login.command.js'
import { LogoutHandler } from './application/commands/logout.command.js'
import { RefreshSessionHandler } from './application/commands/refresh-session.command.js'
import { RegisterUserHandler } from './application/commands/register-user.command.js'
import { AccessTokenSigner, PasswordHasher } from './application/ports.js'
import { GetUserHandler } from './application/queries/get-user.query.js'
import { UserReadModel } from './application/queries/user-read-model.js'
import { TokenIssuer } from './application/token-issuer.js'
import { RefreshTokenRepository } from './domain/refresh-token.repository.js'
import { UserRepository } from './domain/user.repository.js'
import { AuthController } from './infrastructure/http/auth.controller.js'
import { RefreshTokenEntity } from './infrastructure/persistence/refresh-token.entity.js'
import { TypeormRefreshTokenRepository } from './infrastructure/persistence/typeorm-refresh-token.repository.js'
import { TypeormUserReadModel } from './infrastructure/persistence/typeorm-user.read-model.js'
import { TypeormUserRepository } from './infrastructure/persistence/typeorm-user.repository.js'
import { UserEntity } from './infrastructure/persistence/user.entity.js'
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher.js'
import { JwtAccessTokenSigner } from './infrastructure/security/jwt-access-token-signer.js'

/** Bounded context `identity`: usuarios, credenciales y sesiones. */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    // Global: el `JwtAuthGuard` de shared verifica tokens en todas las rutas.
    JwtModule.registerAsync({
      global: true,
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
    { provide: UserRepository, useClass: TypeormUserRepository },
    {
      provide: RefreshTokenRepository,
      useClass: TypeormRefreshTokenRepository,
    },
    { provide: UserReadModel, useClass: TypeormUserReadModel },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AccessTokenSigner, useClass: JwtAccessTokenSigner },
    {
      provide: TokenIssuer,
      inject: [RefreshTokenRepository, AccessTokenSigner, ConfigService],
      useFactory: (
        refreshTokens: RefreshTokenRepository,
        signer: AccessTokenSigner,
        config: ConfigService<Env, true>,
      ) =>
        new TokenIssuer(refreshTokens, signer, {
          access: config.get('ACCESS_TOKEN_TTL', { infer: true }),
          refresh: config.get('REFRESH_TOKEN_TTL', { infer: true }),
        }),
    },
    RegisterUserHandler,
    LoginHandler,
    RefreshSessionHandler,
    LogoutHandler,
    GetUserHandler,
  ],
})
export class IdentityModule {}
