import { DomainError } from '../../shared/domain/domain-error.js'

/** Normalizado (sin espacios, en minúsculas): dos emails iguales son el mismo usuario. */
export class Email {
  private constructor(readonly value: string) {}

  static of(raw: string): Email {
    const value = raw.trim().toLowerCase()
    if (value.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(value)) {
      throw new DomainError('Invalid email')
    }
    return new Email(value)
  }
}
