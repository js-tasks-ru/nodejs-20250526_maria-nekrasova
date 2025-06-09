import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as fs from "fs";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      message: exception.message || "Internal server error",
      timestamp: new Date().toISOString(),
    };

    // Log the error
    const logMessage = `[${new Date().toISOString()}] ${status} - ${errorResponse.message}\n`;
    fs.appendFileSync("errors.log", logMessage);

    response.status(status).json(errorResponse);
  }
}
