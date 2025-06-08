import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";

export class ApiVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {}
}
