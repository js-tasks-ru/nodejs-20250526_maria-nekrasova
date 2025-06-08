import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  Controller,
  Get,
  Param,
  UsePipes,
} from "@nestjs/common";
import * as request from "supertest";
import { ParseIntPipe } from "../../pipes/parse-int.pipe";

@Controller("mock")
class MockController {
  @Get(":id")
  getMockData(@Param("id", ParseIntPipe) id: number) {
    return { id, message: "Mock Data" };
  }
}

describe("ParseIntPipe", () => {
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

  it("should return 400 for non-numeric ID", async () => {
    const response = await request(app.getHttpServer())
      .get("/mock/abc")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: '"abc" не является числом',
        error: "Bad Request",
      }),
    );
  });

  it("should allow numeric ID", async () => {
    const response = await request(app.getHttpServer())
      .get("/mock/123")
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 123,
        message: "Mock Data",
      }),
    );
  });
});
