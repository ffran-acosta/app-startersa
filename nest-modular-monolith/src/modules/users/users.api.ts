import { ConflictException, Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import { UsersRepository, type UserView } from './users.repository.js'

const BCRYPT_ROUNDS = 10

export interface NewUser {
  email: string
  password: string
  name: string
}

/** Lo único de `users` que pueden usar otros módulos. El hash no sale de acá. */
@Injectable()
export class UsersApi {
  constructor(private readonly users: UsersRepository) {}

  async register(input: NewUser): Promise<UserView> {
    if (await this.users.existsByEmail(input.email)) {
      throw new ConflictException('Email already registered')
    }
    return this.users.create({
      email: input.email,
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    })
  }

  /** `null` si el email no existe o la contraseña no coincide. */
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserView | null> {
    const found = await this.users.findByEmailWithPassword(email)
    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      return null
    }
    const { passwordHash, ...user } = found
    return user
  }

  findById(id: string): Promise<UserView | null> {
    return this.users.findById(id)
  }
}
