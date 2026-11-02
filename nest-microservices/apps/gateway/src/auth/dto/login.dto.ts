import { Transform } from 'class-transformer'
import type { Credentials } from '../../../../../libs/contracts/index.js'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto implements Credentials {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
