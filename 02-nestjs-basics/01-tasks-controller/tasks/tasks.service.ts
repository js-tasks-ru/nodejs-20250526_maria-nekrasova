import { Injectable, NotFoundException } from "@nestjs/common";
import { Task } from "./task.model";

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {}

  getTaskById(id: string): Task {}

  createTask(task: Task): Task {}

  updateTask(id: string, update: Task): Task {}

  deleteTask(id: string): Task {}
}
