import { IsInt, IsString, IsUrl, Max, Min, MinLength } from 'class-validator'

export class Env {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3005

  @IsUrl({ protocols: ['nats'], require_tld: false })
  NATS_URL: string = 'nats://localhost:4222'

  /** El mismo que usa auth para firmar: el gateway verifica sin consultarlo. */
  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:5173'
}
