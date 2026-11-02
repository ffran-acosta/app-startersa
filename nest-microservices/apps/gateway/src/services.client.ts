import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom, timeout } from 'rxjs'
import type {
  Json,
  MessagePayload,
  MessageResult,
  Pattern,
  RpcErrorBody,
} from '../../../libs/contracts/index.js'

export const NATS_CLIENT = Symbol('NATS_CLIENT')

const REPLY_TIMEOUT_MS = 5000

/** Request-response tipado hacia los servicios por NATS. */
@Injectable()
export class ServicesClient {
  private readonly logger = new Logger(ServicesClient.name)

  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {}

  async send<P extends Pattern>(
    pattern: P,
    payload: MessagePayload<P>,
  ): Promise<Json<MessageResult<P>>> {
    try {
      return await firstValueFrom(
        this.client
          .send<Json<MessageResult<P>>>(pattern, payload)
          .pipe(timeout(REPLY_TIMEOUT_MS)),
      )
    } catch (error) {
      if (isRpcErrorBody(error)) {
        throw new HttpException(error.message, error.statusCode)
      }
      this.logger.error(`${pattern}: ${String(error)}`)
      // Un `Error` es del transporte (timeout, nadie escuchando el patrón);
      // lo demás es un error no manejado dentro del servicio.
      throw error instanceof Error
        ? new ServiceUnavailableException('Service unavailable')
        : new InternalServerErrorException()
    }
  }
}

function isRpcErrorBody(error: unknown): error is RpcErrorBody {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}
