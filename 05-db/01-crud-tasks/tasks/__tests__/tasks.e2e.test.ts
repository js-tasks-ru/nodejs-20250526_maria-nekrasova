import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../entities/task.entity";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let repository: Repository<Task>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repository.clear();

    await repository.save([
      {
        id: 1,
        title: "Task 1",
        description: "task 1 description",
        isCompleted: false,
      },
      {
        id: 2,
        title: "Task 2",
        description: "task 2 description",
        isCompleted: true,
      },
    ]);
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks")
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Task 1",
            description: "task 1 description",
            isCompleted: false,
          }),
          expect.objectContaining({
            id: 2,
            title: "Task 2",
            description: "task 2 description",
            isCompleted: true,
          }),
        ]),
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
          id: 1,
          title: "Task 1",
          description: "task 1 description",
          isCompleted: false,
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer()).get("/tasks/999").expect(404);
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "New Task",
        description: "new task description",
        isCompleted: false,
      };

      const response = await request(app.getHttpServer())
        .post("/tasks")
        .send(newTask)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: "New Task",
          description: "new task description",
          isCompleted: false,
        }),
      );

      const tasks = await repository.find();
      expect(tasks.length).toBe(3);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {
      const update = {
        title: "Updated Task",
        description: "updated task description",
        isCompleted: true,
      };

      const response = await request(app.getHttpServer())
        .patch("/tasks/1")
        .send(update)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Updated Task",
          description: "updated task description",
          isCompleted: true,
        }),
      );

      const task = await repository.findOneBy({ id: 1 });
      expect(task).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Updated Task",
          description: "updated task description",
          isCompleted: true,
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      const update = { title: "Non-existent Task" };
      await request(app.getHttpServer())
        .patch("/tasks/999")
        .send(update)
        .expect(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task", async () => {
      await request(app.getHttpServer()).delete("/tasks/1").expect(200);

      const tasks = await repository.find();
      expect(tasks.length).toBe(1);
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer()).delete("/tasks/999").expect(404);
    });
  });
});
