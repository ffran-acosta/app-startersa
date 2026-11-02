import { Module } from '@nestjs/common'
import { UsersApi } from './users.api.js'
import { UsersRepository } from './users.repository.js'

@Module({
  providers: [UsersApi, UsersRepository],
  exports: [UsersApi],
})
export class UsersModule {}
