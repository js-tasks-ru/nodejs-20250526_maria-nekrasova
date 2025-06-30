import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop({ unique: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  isCompleted: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
