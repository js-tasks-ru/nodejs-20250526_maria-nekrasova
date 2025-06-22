import { Injectable } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  create(createTaskDto: CreateTaskDto) {}

  async findAll() {}

  async findOne(id: number) {}

  async update(id: number, updateTaskDto: UpdateTaskDto) {}

  async remove(id: number): Promise<void> {}
}
