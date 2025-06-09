import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from "./task.model";

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks() {
    return { tasks: this.tasks };
  }

  getTaskById(id: number) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return { task };
  }

  createTask(task: CreateTaskDto) {
    const { title, description } = task;

    const newTask: Task = {
      id: this.tasks.length + 1,
      title,
      description,
      status: TaskStatus.Pending,
    };

    this.tasks.push(newTask);
    return { task: newTask };
  }

  updateTask(id: number, update: UpdateTaskDto) {
    const { task } = this.getTaskById(id);

    const { title, description, status } = update;
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    return { task };
  }

  deleteTask(id: number) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return { task };
  }
}
