import { CanActivate, ExecutionContext } from "@nestjs/common";

export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {}
}
