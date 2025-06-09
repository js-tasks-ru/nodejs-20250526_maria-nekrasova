import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  Controller,
  Get,
} from "@nestjs/common";
import * as request from "supertest";
import { LoggingMiddleware } from "../logging.middleware";

@Controller("mock")
class MockController {
  @Get()
  getMockData() {
    return { message: "Mock Data" };
  }
}

@Module({
  controllers: [MockController],
})
class MockModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes(MockController);
  }
}

describe("LoggingMiddleware", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should log request method and path", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await request(app.getHttpServer()).get("/mock").expect(200);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[GET] /mock"),
    );
    consoleSpy.mockRestore();
  });
});
