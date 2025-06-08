import { IsString, IsNotEmpty, IsIn, IsNumber } from "class-validator";
import { PartialType, PickType } from "@nestjs/swagger";

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}

export class Task {
  @IsNumber()
  @IsNotEmpty()
  id: number;

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

export class CreateTaskDto extends PartialType(
  PickType(Task, ["title", "description", "status"] as const),
) {}
export class UpdateTaskDto extends PartialType(
  PickType(Task, ["title", "description", "status"] as const),
) {}
