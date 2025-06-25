import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Task } from "./schemas/task.schema";
import { Model, ObjectId } from "mongoose";

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private TaskModel: Model<Task>) {}

  create(createTaskDto: CreateTaskDto) {}

  async findAll() {}

  async findOne(id: ObjectId) {}

  async update(id: ObjectId, updateTaskDto: UpdateTaskDto) {}

  async remove(id: ObjectId) {}
}
