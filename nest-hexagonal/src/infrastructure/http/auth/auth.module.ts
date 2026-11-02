import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GetCurrentUser } from '../../../application/auth/get-current-user.js'
import { Login } from '../../../application/auth/login.js'
import { Logout } from '../../../application/auth/logout.js'
import {
  AccessTokenSigner,
  PasswordHasher,
} from '../../../application/auth/ports.js'
import { RefreshSession } from '../../../application/auth/refresh-session.js'
import { Register } from '../../../application/auth/register.js'
import { TokenIssuer } from '../../../application/auth/token-issuer.js'
import { RefreshTokenRepository } from '../../../domain/auth/refresh-token.repository.js'
import { UserRepository } from '../../../domain/user/user.repository.js'
import type { Env } from '../../config/env.js'
import { provideUseCase } from '../../provide-use-case.js'
import { BcryptPasswordHasher } from '../../security/bcrypt-password-hasher.js'
import { JwtAccessTokenSigner } from '../../security/jwt-access-token-signer.js'
import { AuthController } from './auth.controller.js'

@Module({
  imports: [
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
    provideUseCase(Register, [UserRepository, PasswordHasher, TokenIssuer]),
    provideUseCase(Login, [UserRepository, PasswordHasher, TokenIssuer]),
    provideUseCase(RefreshSession, [
      RefreshTokenRepository,
      UserRepository,
      TokenIssuer,
    ]),
    provideUseCase(Logout, [RefreshTokenRepository]),
    provideUseCase(GetCurrentUser, [UserRepository]),
  ],
})
export class AuthModule {}
