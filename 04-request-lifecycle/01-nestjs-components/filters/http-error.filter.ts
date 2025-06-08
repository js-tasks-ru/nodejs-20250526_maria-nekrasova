import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import * as fs from 'fs';
import { Response } from 'express';

export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const message =
      exception instanceof HttpException
        ? (typeof exception.getResponse() === 'string'
          ? exception.getResponse()
          : (exception.getResponse() as any).message || exception.message)
        : exception instanceof Error
          ? exception.message
          : 'Внутренняя ошибка сервера';

    const logMessage = `[${new Date().toISOString()}] ${status} - ${message}\n`;
    fs.appendFileSync('errors.log', logMessage);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
