import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { isValidObjectId, Types } from "mongoose";

@Injectable()
export class ObjectIDPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value))
      throw new BadRequestException("not a valid object id");
    return new Types.ObjectId(value);
  }
}
