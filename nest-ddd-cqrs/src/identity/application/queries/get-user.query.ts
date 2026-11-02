import { Query, QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { UnauthorizedError } from '../../../shared/application/errors.js'
import { UserReadModel, type UserView } from './user-read-model.js'

/** El usuario autenticado; si ya no existe, su token deja de valer. */
export class GetUserQuery extends Query<UserView> {
  constructor(readonly userId: string) {
    super()
  }
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly users: UserReadModel) {}

  async execute({ userId }: GetUserQuery): Promise<UserView> {
    const user = await this.users.findById(userId)
    if (!user) throw new UnauthorizedError('User no longer exists')
    return user
  }
}
