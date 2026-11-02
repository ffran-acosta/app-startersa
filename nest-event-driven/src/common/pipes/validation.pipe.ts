import { BadRequestException, ValidationPipe } from '@nestjs/common'

export interface ValidationErrorDetail {
  field: string
  message: string
}

export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) =>
    new BadRequestException({
      message: 'Validation failed',
      details: errors.flatMap((error) =>
        Object.values(error.constraints ?? {}).map(
          (message): ValidationErrorDetail => ({
            field: error.property,
            message,
          }),
        ),
      ),
    }),
})
