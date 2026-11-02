import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type {
  NewUser,
  UserRepository,
  UserWithPassword,
} from '../../domain/user/user.repository.js'
import type { User } from '../../domain/user/user.js'
import { DrizzleService } from './drizzle.service.js'
import { users } from './schema.js'

const userColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
}

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: string): Promise<User | null> {
    const [user] = await this.drizzle.db
      .select(userColumns)
      .from(users)
      .where(eq(users.id, id))
    return user ?? null
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const [user] = await this.drizzle.db
      .select({ ...userColumns, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
    return user ?? null
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.drizzle.db.$count(users, eq(users.email, email))) > 0
  }

  async create(user: NewUser): Promise<User> {
    const [created] = await this.drizzle.db
      .insert(users)
      .values(user)
      .returning(userColumns)
    return created
  }
}
