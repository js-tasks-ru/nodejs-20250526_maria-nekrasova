import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { Task } from "./task.model";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAllTasks() {}

  @Get(":id")
  getTaskById(@Param("id") id: string) {}

  @Post()
  createTask(@Body() task: Task) {}

  @Patch(":id")
  updateTask(@Param("id") id: string, @Body() task: Task) {}

  @Delete(":id")
  deleteTask(@Param("id") id: string) {}
}
