import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../../application/errors.js'
import type { ValidationErrorDetail } from './validation.pipe.js'

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

const ERROR_CODES: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
}

/** Errores de la capa de aplicación y su status HTTP. */
const APPLICATION_ERRORS = [
  [NotFoundError, HttpStatus.NOT_FOUND],
  [ConflictError, HttpStatus.CONFLICT],
  [UnauthorizedError, HttpStatus.UNAUTHORIZED],
] as const

/** Toda respuesta de error sigue el schema `Error` del contrato. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let details: ValidationErrorDetail[] | undefined
    const applicationError = APPLICATION_ERRORS.find(
      ([type]) => exception instanceof type,
    )

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      message = exception.message
      const body = exception.getResponse()
      if (typeof body === 'object' && 'details' in body) {
        details = body.details as ValidationErrorDetail[]
      }
    } else if (applicationError && exception instanceof Error) {
      statusCode = applicationError[1]
      message = exception.message
    } else {
      this.logger.error(exception)
    }

    const error =
      ERROR_CODES[statusCode] ??
      (statusCode >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR')

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
