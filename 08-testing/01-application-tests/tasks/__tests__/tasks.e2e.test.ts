import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    repository = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repository.clear();

    await repository.save([
      { title: "Task 1", description: "Desc 1", isCompleted: false },
      { title: "Task 2", description: "Desc 2", isCompleted: true },
    ]);
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app.getHttpServer()).get("/tasks").expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty("title", "Task 1");
      expect(response.body[1]).toHaveProperty("title", "Task 2");
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return task by id", async () => {
      const task = await repository.findOneBy({ title: "Task 1" });

      const response = await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .expect(200);

      expect(response.body).toHaveProperty("title", "Task 1");
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer())
        .get("/tasks/9999")
        .expect(404);
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const newTask = { title: "New Task", description: "New Desc" };

      const response = await request(app.getHttpServer())
        .post("/tasks")
        .send(newTask)
        .expect(201);

      expect(response.body).toMatchObject(newTask);

      const taskInDb = await repository.findOneBy({ id: response.body.id });
      expect(taskInDb).not.toBeNull();
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {
      const task = await repository.findOneBy({ title: "Task 1" });

      const update = { isCompleted: true, description: "Updated Desc" };

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send(update)
        .expect(200);

      expect(response.body).toMatchObject(update);

      const updatedTask = await repository.findOneBy({ id: task.id });
      expect(updatedTask.isCompleted).toBe(true);
      expect(updatedTask.description).toBe("Updated Desc");
    });

    it("should return 404 when updating non-existent task", async () => {
      await request(app.getHttpServer())
        .patch("/tasks/9999")
        .send({ isCompleted: true })
        .expect(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete an existing task", async () => {
      const task = await repository.findOneBy({ title: "Task 1" });

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .expect(200);

      const deletedTask = await repository.findOneBy({ id: task.id });
      expect(deletedTask).toBeNull();
    });

    it("should return 404 when deleting non-existent task", async () => {
      await request(app.getHttpServer())
        .delete("/tasks/9999")
        .expect(404);
    });
  });
});
