export const Role = { USER: 'USER', ADMIN: 'ADMIN' } as const
export type Role = (typeof Role)[keyof typeof Role]

/** Lo que el gateway saca del access token y manda a los servicios. */
export interface AuthUser {
  id: string
  role: Role
}

export interface UserView {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type AuthResponse = TokenPair & { user: UserView }

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface Credentials {
  email: string
  password: string
}

export interface AuthMessages {
  'auth.register': { payload: RegisterData; result: AuthResponse }
  'auth.login': { payload: Credentials; result: AuthResponse }
  'auth.refresh': { payload: { refreshToken: string }; result: TokenPair }
  'auth.logout': { payload: { refreshToken: string }; result: null }
  'auth.me': { payload: { userId: string }; result: UserView }
}
