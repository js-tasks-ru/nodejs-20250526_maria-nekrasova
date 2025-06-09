import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TaskStatus } from "./task.model";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query("status") status?: TaskStatus,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (
      (page && isNaN(parsedPage)) ||
      (limit && isNaN(parsedLimit)) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      throw new BadRequestException('Invalid page or limit');
    }

    return this.tasksService.getFilteredTasks(status, parsedPage, parsedLimit);
  }
}
