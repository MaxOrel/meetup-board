import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ErrorResponse, FieldError } from './error-response.js';

// Приводит любую ошибку к формату контракта { statusCode, message, errors? }
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const body: ErrorResponse = { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Внутренняя ошибка сервера' };

    if (exception instanceof HttpException) {
      body.statusCode = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') body.message = payload;
      else {
        const p = payload as { message?: string | string[]; errors?: FieldError[] };
        body.message = Array.isArray(p.message) ? p.message.join('; ') : (p.message ?? exception.message);
        if (p.errors) body.errors = p.errors;
      }
    } else {
      this.logger.error(exception);
    }

    res.status(body.statusCode).json(body);
  }
}
