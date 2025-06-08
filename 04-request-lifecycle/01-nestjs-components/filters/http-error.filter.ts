import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";

export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {}
}
