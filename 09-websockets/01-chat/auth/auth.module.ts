import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./passport/local.strategy";
import { JwtStrategy } from "./passport/jwt.strategy";
import { GithubStrategy } from "./passport/github.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: "killer-is-jim",
      signOptions: { expiresIn: "24h" },
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GithubStrategy],
})
export class AuthModule {}
