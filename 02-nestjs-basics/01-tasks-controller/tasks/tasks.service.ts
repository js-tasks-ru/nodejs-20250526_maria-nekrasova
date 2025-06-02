import { Injectable, NotFoundException } from "@nestjs/common";
import { Task } from "./task.model";

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  createTask(task: Task): Task {
    const { title, description, status } = task;

    const newTask: Task = {
      id: (this.tasks.length + 1).toString(),
      title,
      description,
      status,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, update: Task): Task {
    const task = this.getTaskById(id);

    const { title, description, status } = update;
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    return task;
  }

  deleteTask(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return task;
  }
}
