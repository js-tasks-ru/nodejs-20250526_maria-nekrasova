import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  Controller,
  Get,
  UseInterceptors,
} from "@nestjs/common";
import * as request from "supertest";
import { ApiVersionInterceptor } from "../../interceptors/api-version.interceptor";

@Controller("mock")
@UseInterceptors(ApiVersionInterceptor)
class MockController {
  @Get()
  getMockData() {
    return { message: "Hello, World!" };
  }
}

describe("ApiVersionInterceptor", () => {
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

  it("should include apiVersion and executionTime in the response", async () => {
    const response = await request(app.getHttpServer())
      .get("/mock")
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        apiVersion: "1.0",
      }),
    );
    expect(response.body.executionTime).toMatch(/^\d+ms$/);
  });
});
