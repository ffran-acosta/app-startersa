import { Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import type { PasswordHasher } from '../../application/ports.js'

const BCRYPT_ROUNDS = 10

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
  }

  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
