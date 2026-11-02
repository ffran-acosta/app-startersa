import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, type FindOptionsWhere, type Repository } from 'typeorm'
import type {
  TodoFilter,
  TodoReadModel,
  TodoView,
} from '../../application/queries/todo-read-model.js'
import { TodoEntity } from './todo.entity.js'

const todoView = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class TypeormTodoReadModel implements TodoReadModel {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly repo: Repository<TodoEntity>,
  ) {}

  async findPage(
    { ownerId, status, search }: TodoFilter,
    offset: number,
    limit: number,
  ) {
    // TypeORM rechaza `undefined` en el where: solo van los filtros presentes.
    const base: FindOptionsWhere<TodoEntity> = {
      ...(ownerId && { ownerId }),
      ...(status && { status }),
    }
    const pattern = search && `%${search.replace(/[\\%_]/g, '\\$&')}%`
    const [items, total] = await this.repo.findAndCount({
      select: todoView,
      where: pattern
        ? [
            { ...base, title: ILike(pattern) },
            { ...base, description: ILike(pattern) },
          ]
        : base,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    })
    return { items, total }
  }

  findById(id: string, ownerId?: string): Promise<TodoView | null> {
    return this.repo.findOne({
      select: todoView,
      where: { id, ...(ownerId && { ownerId }) },
    })
  }
}
