import { DomainError } from '../../shared/domain/domain-error.js'

export class TodoTitle {
  private constructor(readonly value: string) {}

  static of(value: string): TodoTitle {
    if (value.length < 1 || value.length > 200) {
      throw new DomainError('Title must have between 1 and 200 characters')
    }
    return new TodoTitle(value)
  }
}
