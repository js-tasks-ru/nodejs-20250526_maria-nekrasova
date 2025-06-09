import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { map, tap } from 'rxjs/operators';

export class ApiVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const now = Date.now();

    return next.handle().pipe(
      map(data => ({
        ...data,
        apiVersion: '1.0',
      })),
      tap(() => {
        const executionTime = Date.now() - now;
        console.log(`Execution time: ${executionTime}ms`);
      }),
      map(data => ({
        ...data,
        executionTime: `${Date.now() - now}ms`,
      })),
    );
  }
}
