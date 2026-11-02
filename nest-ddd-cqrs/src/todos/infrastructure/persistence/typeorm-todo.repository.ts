import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import { TodoTitle } from '../../domain/todo-title.js'
import type { TodoRepository } from '../../domain/todo.repository.js'
import { Todo } from '../../domain/todo.js'
import { TodoEntity } from './todo.entity.js'

@Injectable()
export class TypeormTodoRepository implements TodoRepository {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly repo: Repository<TodoEntity>,
  ) {}

  async findById(id: string): Promise<Todo | null> {
    const row = await this.repo.findOne({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        ownerId: true,
      },
      where: { id },
    })
    return row && Todo.restore({ ...row, title: TodoTitle.of(row.title) })
  }

  async save(todo: Todo): Promise<void> {
    await this.repo.save(todo.toPrimitives())
  }

  async delete(todo: Todo): Promise<void> {
    await this.repo.delete({ id: todo.id })
  }
}
