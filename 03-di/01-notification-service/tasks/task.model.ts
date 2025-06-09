import { IsString, IsNotEmpty, IsIn, IsNumber } from "class-validator";
import { PartialType, PickType } from "@nestjs/swagger";

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}

export class Task {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsIn(Object.values(TaskStatus))
  status: TaskStatus;

  @IsNumber()
  assignedTo?: number;
}

export class CreateTaskDto extends PickType(Task, [
  "title",
  "description",
  "assignedTo",
]) {}
export class UpdateTaskDto extends PartialType(
  PickType(Task, ["title", "description", "status"] as const),
) {}
