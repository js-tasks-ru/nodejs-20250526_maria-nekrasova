import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    if (context.getType() === "ws") {
      const client: Socket = context.switchToWs().getClient();
      if (!client.data.user) return false;

      const token = client.handshake.auth.token;
      return this.jwtService
        .verifyAsync(token)
        .then((_) => true)
        .catch((_) => false);
    }

    return super.canActivate(context);
  }
}
