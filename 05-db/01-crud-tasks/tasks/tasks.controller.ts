import { Controller, Get, Post, Patch, Delete } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create() {}

  @Get()
  findAll() {}

  @Get(":id")
  findOne() {}

  @Patch(":id")
  update() {}

  @Delete(":id")
  remove() {}
}
