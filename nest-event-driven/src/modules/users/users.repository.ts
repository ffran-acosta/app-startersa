import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service.js'
import type { Prisma } from '../../generated/prisma/client.js'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

export type UserView = Prisma.UserGetPayload<{ select: typeof userSelect }>

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserView | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect })
  }

  findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { ...userSelect, passwordHash: true },
    })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return user !== null
  }

  create(data: Prisma.UserCreateInput): Promise<UserView> {
    return this.prisma.user.create({ data, select: userSelect })
  }
}
