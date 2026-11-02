import { randomUUID } from 'node:crypto'
import { Role, type Actor } from '../../shared/domain/actor.js'
import type { Email } from './email.js'

export interface UserProps {
  id: string
  email: Email
  name: string
  role: Role
  passwordHash: string
}

export class User {
  private constructor(private readonly props: UserProps) {}

  /** Todo usuario nuevo es `USER`; los `ADMIN` se crean por seed. */
  static register(input: Pick<UserProps, 'email' | 'name' | 'passwordHash'>) {
    return new User({ ...input, id: randomUUID(), role: Role.USER })
  }

  static restore(props: UserProps): User {
    return new User(props)
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get actor(): Actor {
    return { id: this.props.id, role: this.props.role }
  }

  toPrimitives() {
    return { ...this.props, email: this.props.email.value }
  }
}
