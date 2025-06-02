import { Injectable, NotFoundException } from "@nestjs/common";
import { Task } from "./task.model";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Задача с id "${id}" не найдена`);
    }
    return task;
  }

  createTask(task: Task): Task {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, update: Task): Task {
    const task = this.getTaskById(id);
    const updatedTask = { ...task, ...update };
    const index = this.tasks.findIndex((t) => t.id === id);
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  deleteTask(id: string): Task {
    const task = this.getTaskById(id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return task;
  }
}
