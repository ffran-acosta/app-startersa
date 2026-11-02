import { IsInt, IsString, IsUrl, Min, MinLength } from 'class-validator'

export class Env {
  @IsUrl({ protocols: ['nats'], require_tld: false })
  NATS_URL: string = 'nats://localhost:4222'

  @IsUrl({ protocols: ['postgresql', 'postgres'], require_tld: false })
  AUTH_DATABASE_URL: string

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string

  @IsInt()
  @Min(60)
  ACCESS_TOKEN_TTL: number = 900

  @IsInt()
  @Min(60)
  REFRESH_TOKEN_TTL: number = 604800
}
