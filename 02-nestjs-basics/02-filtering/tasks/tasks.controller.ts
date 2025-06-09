import { Controller, Get, Query } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TaskStatus } from "./task.model";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query("status") status?: TaskStatus,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.tasksService.getFilteredTasks(
      status as TaskStatus,
      page ? parseInt(page.toString(), 10) : undefined,
      limit ? parseInt(limit.toString(), 10) : undefined,
    );
  }
}
