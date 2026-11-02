import type { UserRepository } from '../../domain/user/user.repository.js'
import type { Actor, User } from '../../domain/user/user.js'
import { UnauthorizedError } from '../errors.js'

export class GetCurrentUser {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor): Promise<User> {
    const user = await this.users.findById(actor.id)
    if (!user) throw new UnauthorizedError('User no longer exists')
    return user
  }
}
