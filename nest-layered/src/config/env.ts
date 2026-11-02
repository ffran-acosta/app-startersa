import { plainToInstance } from 'class-transformer'
import {
  IsInt,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator'

export class Env {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001

  @IsUrl({ protocols: ['postgresql', 'postgres'], require_tld: false })
  DATABASE_URL: string

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string

  @IsInt()
  @Min(60)
  ACCESS_TOKEN_TTL: number = 900

  @IsInt()
  @Min(60)
  REFRESH_TOKEN_TTL: number = 604800

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:5173'
}

export function validateEnv(config: Record<string, unknown>): Env {
  const env = plainToInstance(Env, config, { enableImplicitConversion: true })
  const errors = validateSync(env)
  if (errors.length > 0) {
    throw new Error(`Invalid environment variables:\n${errors.join('')}`)
  }
  return env
}
