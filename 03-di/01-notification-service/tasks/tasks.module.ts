import { Module } from "@nestjs/common";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService, UsersService, NotificationsService],
})
export class TasksModule {}
