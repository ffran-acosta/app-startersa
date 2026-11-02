import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import type {
  UserReadModel,
  UserView,
} from '../../application/queries/user-read-model.js'
import { UserEntity } from './user.entity.js'

@Injectable()
export class TypeormUserReadModel implements UserReadModel {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  findById(id: string): Promise<UserView | null> {
    return this.repo.findOne({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    })
  }
}
