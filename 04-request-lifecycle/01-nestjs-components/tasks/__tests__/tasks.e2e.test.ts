import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { TaskStatus } from "../task.model";
import { TasksService } from "../tasks.service";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let tasksService: TasksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksService = moduleFixture.get<TasksService>(TasksService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Reset tasks in the service
    (tasksService as any).tasks = [
      {
        id: 1,
        title: "Task 1",
        description: "This is a default task for testing",
        status: TaskStatus.Pending,
      },
      {
        id: 2,
        title: "Task 2",
        description: "This is another default task for testing",
        status: TaskStatus.Completed,
      },
    ];
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({ id: 1, title: "Task 1" }),
            expect.objectContaining({ id: 2, title: "Task 2" }),
          ]),
        }),
      );
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return a task by ID", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks/1")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          task: expect.objectContaining({
            id: 1,
            title: "Task 1",
            description: "This is a default task for testing",
            status: TaskStatus.Pending,
          }),
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer()).get("/tasks/999").expect(404);
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task when admin", async () => {
      const newTask = {
        title: "New Task",
        description: "Test task creation",
      };

      const response = await request(app.getHttpServer())
        .post("/tasks")
        .set("x-role", "admin") // Simulate admin role
        .send(newTask)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          task: expect.objectContaining({
            id: expect.any(Number),
            title: "New Task",
            description: "Test task creation",
            status: TaskStatus.Pending,
          }),
        }),
      );
    });

    it("should deny access if not admin", async () => {
      const newTask = {
        title: "New Task",
        description: "Test task creation",
      };

      await request(app.getHttpServer())
        .post("/tasks")
        .set("x-role", "user") // Simulate non-admin role
        .send(newTask)
        .expect(403);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {
      const update = { status: TaskStatus.Completed };

      const response = await request(app.getHttpServer())
        .patch("/tasks/1")
        .send(update)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          task: expect.objectContaining({
            id: 1,
            status: TaskStatus.Completed,
          }),
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      const update = { status: TaskStatus.Completed };

      await request(app.getHttpServer())
        .patch("/tasks/999")
        .send(update)
        .expect(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task when admin", async () => {
      const response = await request(app.getHttpServer())
        .delete("/tasks/1")
        .set("x-role", "admin") // Simulate admin role
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          task: expect.objectContaining({
            id: 1,
          }),
        }),
      );
    });

    it("should deny access if not admin", async () => {
      await request(app.getHttpServer())
        .delete("/tasks/1")
        .set("x-role", "user") // Simulate non-admin role
        .expect(403);
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer())
        .delete("/tasks/999")
        .set("x-role", "admin") // Simulate admin role
        .expect(404);
    });
  });
});
