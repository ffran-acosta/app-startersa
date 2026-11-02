export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

/** Quién ejecuta un caso de uso. */
export interface Actor {
  id: string
  role: Role
}
