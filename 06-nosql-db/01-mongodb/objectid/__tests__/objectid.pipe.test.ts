import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Controller, Get, Param } from "@nestjs/common";
import * as request from "supertest";
import { ObjectIDPipe } from "../objectid.pipe";
import mongoose from "mongoose";

@Controller("mock")
class MockController {
  @Get(":id")
  getMockData(@Param("id", ObjectIDPipe) id: any) {
    return { id: id.toString(), message: "Mock Data" };
  }
}

describe("ObjectIDPipe (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MockController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 400 for non-valid ObjectId", async () => {
    const invalidId = "abc"; // non-valid ObjectId string
    const response = await request(app.getHttpServer())
      .get(`/mock/${invalidId}`)
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "not a valid object id",
        error: "Bad Request",
      }),
    );
  });

  it("should allow valid ObjectId", async () => {
    // Create a valid ObjectId string using mongoose.Types.ObjectId
    const validObjectId = new mongoose.Types.ObjectId().toString();

    const response = await request(app.getHttpServer())
      .get(`/mock/${validObjectId}`)
      .expect(200);

    // Expect the returned id to match the valid ObjectId string and a message
    expect(response.body).toEqual(
      expect.objectContaining({
        id: validObjectId,
        message: "Mock Data",
      }),
    );
  });
});
