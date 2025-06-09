import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'POST' || method === 'DELETE') {
      const role = request.headers['x-role'];

      if (role !== 'admin') {
        throw new ForbiddenException('Доступ запрещён: требуется роль admin');
      }
    }

    return true;
  }
}
