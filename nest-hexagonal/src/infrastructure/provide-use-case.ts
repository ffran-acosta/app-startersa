import type { FactoryProvider } from '@nestjs/common'

type Token<T> = abstract new (...args: never) => T

/**
 * Los casos de uso no llevan decoradores de Nest: se registran con una
 * factory que les pasa sus dependencias en el orden del constructor.
 */
export function provideUseCase<A extends unknown[], T>(
  useCase: new (...args: A) => T,
  inject: { [K in keyof A]: Token<A[K]> },
): FactoryProvider<T> {
  return {
    provide: useCase,
    inject,
    useFactory: (...deps: A) => new useCase(...deps),
  }
}
