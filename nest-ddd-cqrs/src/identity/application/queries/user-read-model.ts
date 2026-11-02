import type { Role } from '../../../shared/domain/actor.js'

/** Lo que devuelve la API: nunca incluye el hash del password. */
export interface UserView {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export abstract class UserReadModel {
  abstract findById(id: string): Promise<UserView | null>
}
