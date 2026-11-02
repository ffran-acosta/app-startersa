import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import {
  rpcError,
  type AuthResponse,
  type AuthUser,
  type Credentials,
  type RegisterData,
  type TokenPair,
  type UserView,
} from '../../../libs/contracts/index.js'
import type { Env } from './env.js'
import { RefreshTokensRepository } from './refresh-tokens.repository.js'
import { UsersRepository } from './users.repository.js'

const BCRYPT_ROUNDS = 10

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(data: RegisterData): Promise<AuthResponse> {
    if (await this.users.existsByEmail(data.email)) {
      throw rpcError(HttpStatus.CONFLICT, 'Email already registered')
    }
    const user = await this.users.create({
      email: data.email,
      name: data.name,
      passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
    })
    return { ...(await this.issueTokens(user)), user }
  }

  async login({ email, password }: Credentials): Promise<AuthResponse> {
    const found = await this.users.findByEmailWithPassword(email)
    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      throw rpcError(HttpStatus.UNAUTHORIZED, 'Invalid credentials')
    }
    const { passwordHash, ...user } = found
    return { ...(await this.issueTokens(user)), user }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const stored = await this.refreshTokens.findByHash(hash(refreshToken))
    const consumed = stored && (await this.refreshTokens.deleteById(stored.id))
    if (!consumed || stored.expiresAt <= new Date()) {
      throw rpcError(
        HttpStatus.UNAUTHORIZED,
        'Invalid or expired refresh token',
      )
    }
    return this.issueTokens(stored.user)
  }

  logout(refreshToken: string): Promise<void> {
    return this.refreshTokens.deleteByHash(hash(refreshToken))
  }

  async me(userId: string): Promise<UserView> {
    const user = await this.users.findById(userId)
    if (!user) throw rpcError(HttpStatus.UNAUTHORIZED, 'User no longer exists')
    return user
  }

  private async issueTokens(user: AuthUser): Promise<TokenPair> {
    const refreshToken = randomBytes(32).toString('base64url')
    const refreshTtl = this.config.get('REFRESH_TOKEN_TTL', { infer: true })
    await this.refreshTokens.create({
      tokenHash: hash(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTtl * 1000),
    })
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }),
      refreshToken,
      expiresIn: this.config.get('ACCESS_TOKEN_TTL', { infer: true }),
    }
  }
}

function hash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
