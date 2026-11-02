import { IsUrl } from 'class-validator'

export class Env {
  @IsUrl({ protocols: ['nats'], require_tld: false })
  NATS_URL: string = 'nats://localhost:4222'

  @IsUrl({ protocols: ['postgresql', 'postgres'], require_tld: false })
  TODOS_DATABASE_URL: string
}
