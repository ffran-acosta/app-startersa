import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service.js'

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { tokenHash: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data, select: { id: true } })
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        expiresAt: true,
        user: { select: { id: true, role: true } },
      },
    })
  }

  /** Devuelve `false` si otro request ya lo consumió (rotación concurrente). */
  async deleteById(id: string): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { id },
    })
    return count === 1
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } })
  }
}
