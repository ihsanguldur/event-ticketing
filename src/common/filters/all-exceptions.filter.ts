import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ClsService } from 'nestjs-cls';

type PgError = Error & {
  code?: string;
  constraint?: string;
  detail?: string;
};

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly cls: ClsService) {}

  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { statusCode, message } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(exception);
    }

    res.status(statusCode).json({
      requestId: this.cls.getId(),
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
      return { statusCode: exception.getStatus(), message };
    }

    if (exception instanceof QueryFailedError) {
      const { code } = exception.driverError as PgError;
      if (code === PG_UNIQUE_VIOLATION) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'resource already exists',
        };
      }
      if (code === PG_FOREIGN_KEY_VIOLATION) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'related resource conflict',
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'internal server error',
    };
  }
}
