import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import { Email } from '../../domain/email.js'
import type { UserRepository } from '../../domain/user.repository.js'
import { User } from '../../domain/user.js'
import { UserEntity } from './user.entity.js'

const userProps = {
  id: true,
  email: true,
  name: true,
  role: true,
  passwordHash: true,
} as const

@Injectable()
export class TypeormUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ select: userProps, where: { id } })
    return row && toUser(row)
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.repo.findOne({
      select: userProps,
      where: { email: email.value },
    })
    return row && toUser(row)
  }

  existsByEmail(email: Email): Promise<boolean> {
    return this.repo.existsBy({ email: email.value })
  }

  async save(user: User): Promise<void> {
    await this.repo.save(user.toPrimitives())
  }
}

function toUser(row: UserEntity): User {
  return User.restore({ ...row, email: Email.of(row.email) })
}
