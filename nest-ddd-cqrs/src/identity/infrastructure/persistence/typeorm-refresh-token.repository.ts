import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import type {
  NewRefreshToken,
  RefreshTokenRepository,
} from '../../domain/refresh-token.repository.js'
import { RefreshTokenEntity } from './refresh-token.entity.js'

@Injectable()
export class TypeormRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repo: Repository<RefreshTokenEntity>,
  ) {}

  async create(token: NewRefreshToken): Promise<void> {
    await this.repo.insert(token)
  }

  /** Un único `DELETE … RETURNING`: atómico frente a requests concurrentes. */
  async consume(tokenHash: string) {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where({ tokenHash })
      // Nombres de propiedad (un nombre de columna se ignora sin error);
      // las filas de `raw` vuelven con nombres de columna.
      .returning(['userId', 'expiresAt'])
      .execute()
    const [token] = result.raw as { user_id: string; expires_at: Date }[]
    return token ? { userId: token.user_id, expiresAt: token.expires_at } : null
  }
}
