export interface NewRefreshToken {
  tokenHash: string
  userId: string
  expiresAt: Date
}

export abstract class RefreshTokenRepository {
  abstract create(token: NewRefreshToken): Promise<void>
  /**
   * Borra el token y devuelve sus datos, o `null` si no existía. Es atómico:
   * dos requests concurrentes no pueden consumir el mismo token.
   */
  abstract consume(
    tokenHash: string,
  ): Promise<{ userId: string; expiresAt: Date } | null>
}
