import { plainToInstance, type ClassConstructor } from 'class-transformer'
import { validateSync } from 'class-validator'

/** `validate` de `ConfigModule.forRoot`: cada app valida solo sus variables. */
export function envValidator<T extends object>(Env: ClassConstructor<T>) {
  return (config: Record<string, unknown>): T => {
    const env = plainToInstance(Env, config, { enableImplicitConversion: true })
    const errors = validateSync(env)
    if (errors.length > 0) {
      throw new Error(`Invalid environment variables:\n${errors.join('')}`)
    }
    return env
  }
}
