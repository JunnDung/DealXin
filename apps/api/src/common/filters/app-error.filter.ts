import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../logger';

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) ?? 'unknown';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as Record<string, unknown>;

      logger.warn(
        {
          requestId,
          method: request.method,
          url: request.url,
          statusCode: status,
          error: exception.name,
          message: exception.message,
        },
        'HTTP Exception',
      );

      response.status(status).json({
        success: false,
        error: {
          code: exception.name,
          message: exception.message,
          details: body?.message ?? undefined,
        },
        timestamp: new Date().toISOString(),
        requestId,
      });
      return;
    }

    logger.error(
      {
        requestId,
        method: request.method,
        url: request.url,
        error: exception instanceof Error ? exception.name : 'UnknownError',
        message: exception instanceof Error ? exception.message : String(exception),
      },
      'Unhandled exception',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}
