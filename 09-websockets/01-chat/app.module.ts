import * as path from "node:path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt.guard";
import { RolesGuard } from "./auth/roles.guard";
import { ChatModule } from "./chat/chat.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "client"),
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: ":memory:",
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
