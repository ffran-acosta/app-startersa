import type { User } from './user.js'

export interface NewUser {
  email: string
  name: string
  passwordHash: string
}

export type UserWithPassword = User & { passwordHash: string }

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null>
  abstract existsByEmail(email: string): Promise<boolean>
  abstract create(user: NewUser): Promise<User>
}
