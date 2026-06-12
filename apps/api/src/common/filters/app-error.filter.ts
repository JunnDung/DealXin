import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { type Request, type Response } from "express";

import { logger } from "../logger";

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const requestId = (request.headers["x-request-id"] as string) ?? "unknown";

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
        "HTTP Exception",
      );

      response.status(status).json({
        success: false,
        error: {
          code: exception.name,
          message:
            typeof body?.message === "string" ? body.message : "Bad Request",
          details: Array.isArray(body?.errors)
            ? body.errors
            : Array.isArray(body?.details)
              ? body.details
              : typeof body?.message === "object"
                ? body.message
                : undefined,
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
        error: exception instanceof Error ? exception.name : "UnknownError",
        message:
          exception instanceof Error ? exception.message : String(exception),
      },
      "Unhandled exception",
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}
