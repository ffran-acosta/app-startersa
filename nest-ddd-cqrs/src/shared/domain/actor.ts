export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/** Quién ejecuta un comando o query. Lo comparten todos los contextos. */
export interface Actor {
  id: string
  role: Role
}
