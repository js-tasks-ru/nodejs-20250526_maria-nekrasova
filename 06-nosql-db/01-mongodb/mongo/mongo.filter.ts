import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";

@Catch(mongoose.Error.ValidationError, mongoose.mongo.MongoError)
export class MongoFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Duplicate key error';

    if (exception instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(exception.errors).map((err: any) => err.message);
      message = errors.join('; ');
    }

    else if (exception.code === 11000) {
      const duplicatedField = Object.keys(exception.keyValue).join(', ');
      const duplicatedValue = Object.values(exception.keyValue).join(', ');
      message = `Значение "${duplicatedValue}" поля "${duplicatedField}" уже используется`;
    }

    response.status(400).json({
      statusCode: 400,
      message,
      error: 'Bad Request',
    });
  }
}
