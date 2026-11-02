import { Transform } from 'class-transformer'
import type { RegisterData } from '../../../../../libs/contracts/index.js'
import { IsEmail, IsString, Length, MaxLength } from 'class-validator'

export class RegisterDto implements RegisterData {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string

  @IsString()
  @Length(8, 72)
  password: string

  @IsString()
  @Length(1, 100)
  name: string
}
