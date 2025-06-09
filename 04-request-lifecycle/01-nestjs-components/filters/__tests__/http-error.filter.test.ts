import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Controller, Get } from "@nestjs/common";
import * as request from "supertest";
import * as fs from "fs";
import { HttpErrorFilter } from "../http-error.filter";

@Controller("mock")
export class MockController {
  @Get("error")
  throwError() {
    throw new Error("Mock error for testing");
  }
}

describe("HttpErrorFilter", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MockController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter()); // Register the filter globally
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should log errors to errors.log", async () => {
    const fsSpy = jest.spyOn(fs, "appendFileSync").mockImplementation();

    await request(app.getHttpServer()).get("/mock/error").expect(500);

    expect(fsSpy).toHaveBeenCalledWith(
      "errors.log",
      expect.stringMatching(/\[.*\] 500 - Mock error for testing\n/),
    );

    fsSpy.mockRestore();
  });

  it("should return a unified error response", async () => {
    const response = await request(app.getHttpServer())
      .get("/mock/error")
      .expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      message: "Mock error for testing",
      timestamp: expect.any(String),
    });
  });
});
