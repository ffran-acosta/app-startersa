import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service.js'
import { OutboxRepository } from '../../events/outbox.repository.js'
import type { Prisma } from '../../generated/prisma/client.js'
import { TodoEvent, type TodoEventPayload } from './todo-events.js'

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

export type TodoView = Prisma.TodoGetPayload<{ select: typeof todoSelect }>

@Injectable()
export class TodosRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxRepository,
  ) {}

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

  // Cada escritura guarda su evento en el outbox dentro de la misma transacción.

  create(data: Prisma.TodoUncheckedCreateInput): Promise<TodoView> {
    return this.prisma.$transaction(async (tx) => {
      const todo = await tx.todo.create({ data, select: todoSelect })
      await this.outbox.add(tx, TodoEvent.Created, {
        todoId: todo.id,
        actorId: todo.ownerId,
      } satisfies TodoEventPayload)
      return todo
    })
  }

  update(
    id: string,
    data: Prisma.TodoUpdateInput,
    actorId: string,
  ): Promise<TodoView> {
    return this.prisma.$transaction(async (tx) => {
      const todo = await tx.todo.update({
        where: { id },
        data,
        select: todoSelect,
      })
      await this.outbox.add(tx, TodoEvent.Updated, {
        todoId: id,
        actorId,
      } satisfies TodoEventPayload)
      return todo
    })
  }

  /** Devuelve `false` si no hay un todo con ese `id` dentro de `scope`. */
  delete(
    id: string,
    scope: Prisma.TodoWhereInput,
    actorId: string,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.todo.deleteMany({ where: { ...scope, id } })
      if (count === 0) return false
      await this.outbox.add(tx, TodoEvent.Deleted, {
        todoId: id,
        actorId,
      } satisfies TodoEventPayload)
      return true
    })
  }
}
