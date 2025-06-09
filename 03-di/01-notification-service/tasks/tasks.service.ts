import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from "./task.model";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto) {
    const { title, description, assignedTo } = createTaskDto;

    const user = this.usersService.getUserById(assignedTo);
    if (!user) {
      throw new NotFoundException(`User with ID ${assignedTo} not found`);
    }

    const task: Task = {
      id: (this.tasks.length + 1).toString(),
      title,
      description,
      status: TaskStatus.Pending,
      assignedTo,
    };

    this.tasks.push(task);

    if (!user.email) {
      throw new BadRequestException("User email is missing");
    }

    this.notificationsService.sendEmail(
      user.email,
      "Новая задача",
      `Вы назначены ответственным за задачу: "${title}"`,
    );

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`);
    }

    Object.assign(task, updateTaskDto);

    const user = this.usersService.getUserById(task.assignedTo);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${task.assignedTo} not found`,
      );
    }

    if (!user.phone) {
      throw new BadRequestException("User phone number is missing");
    }

    this.notificationsService.sendSMS(
      user.phone,
      `Статус задачи "${task.title}" обновлён на "${task.status}"`,
    );

    return task;
  }
}
