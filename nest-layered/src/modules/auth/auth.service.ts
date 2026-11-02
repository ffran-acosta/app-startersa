import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import type { AuthUser } from '../../common/decorators/current-user.decorator.js'
import type { Env } from '../../config/env.js'
import { UsersRepository, type UserView } from '../users/users.repository.js'
import type { LoginDto } from './dto/login.dto.js'
import type { RegisterDto } from './dto/register.dto.js'
import { RefreshTokensRepository } from './refresh-tokens.repository.js'

const BCRYPT_ROUNDS = 10

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type AuthResponse = TokenPair & { user: UserView }

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (await this.users.existsByEmail(dto.email)) {
      throw new ConflictException('Email already registered')
    }
    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    })
    return { ...(await this.issueTokens(user)), user }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const found = await this.users.findByEmailWithPassword(dto.email)
    if (!found || !(await bcrypt.compare(dto.password, found.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const { passwordHash, ...user } = found
    return { ...(await this.issueTokens(user)), user }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const stored = await this.refreshTokens.findByHash(hash(refreshToken))
    const consumed = stored && (await this.refreshTokens.deleteById(stored.id))
    if (!consumed || stored.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
    return this.issueTokens(stored.user)
  }

  logout(refreshToken: string): Promise<void> {
    return this.refreshTokens.deleteByHash(hash(refreshToken))
  }

  async me(user: AuthUser): Promise<UserView> {
    const found = await this.users.findById(user.id)
    if (!found) throw new UnauthorizedException('User no longer exists')
    return found
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
