import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Controller, Get } from "@nestjs/common";
import * as request from "supertest";
import { MongoFilter } from "../mongo.filter";
import mongoose from "mongoose";

@Controller("mock")
export class MockController {
  @Get("validation-error")
  throwValidationError() {
    const err = new mongoose.Error.ValidationError();
    err.message = "Validation error message";
    throw err;
  }

  @Get("mongo-error")
  throwMongoError() {
    throw new mongoose.mongo.MongoError("Duplicate key error");
  }
}

describe("MongoFilter", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MockController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new MongoFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /mock/validation-error", () => {
    it("should return 400 and the correct response body for a ValidationError", async () => {
      const response = await request(app.getHttpServer())
        .get("/mock/validation-error")
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation error message",
      });
    });
  });

  describe("GET /mock/mongo-error", () => {
    it("should return 400 and the correct response body for a MongoError", async () => {
      const response = await request(app.getHttpServer())
        .get("/mock/mongo-error")
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: "Duplicate key error",
      });
    });
  });
});
