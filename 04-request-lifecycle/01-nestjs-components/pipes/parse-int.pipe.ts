import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string): number {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new BadRequestException(`"${value}" не является числом`);
    }
    return parsedValue;
  }
}
