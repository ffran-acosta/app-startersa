import { Injectable } from '@nestjs/common'
import type { TodoView } from '../../../libs/contracts/index.js'
import type { Prisma } from './generated/prisma/client.js'
import { PrismaService } from './prisma.service.js'

const todoSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TodoSelect

@Injectable()
export class TodosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPage(
    where: Prisma.TodoWhereInput,
    skip: number,
    take: number,
  ): Promise<[TodoView[], number]> {
    return this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        select: todoSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.todo.count({ where }),
    ])
  }

  findFirst(where: Prisma.TodoWhereInput): Promise<TodoView | null> {
    return this.prisma.todo.findFirst({ where, select: todoSelect })
  }

  create(data: Prisma.TodoUncheckedCreateInput): Promise<TodoView> {
    return this.prisma.todo.create({ data, select: todoSelect })
  }

  update(id: string, data: Prisma.TodoUpdateInput): Promise<TodoView> {
    return this.prisma.todo.update({ where: { id }, data, select: todoSelect })
  }

  async deleteMany(where: Prisma.TodoWhereInput): Promise<number> {
    const { count } = await this.prisma.todo.deleteMany({ where })
    return count
  }
}
