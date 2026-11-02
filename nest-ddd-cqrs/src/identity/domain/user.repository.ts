import type { Email } from './email.js'
import type { User } from './user.js'

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByEmail(email: Email): Promise<User | null>
  abstract existsByEmail(email: Email): Promise<boolean>
  abstract save(user: User): Promise<void>
}
