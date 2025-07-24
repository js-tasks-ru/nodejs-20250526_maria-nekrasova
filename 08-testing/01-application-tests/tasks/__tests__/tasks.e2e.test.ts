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

    // Заполняем базу тестовыми данными
    await repository.save([
      {
        id: 1,
        title: "Task 1",
        description: "Description 1",
        isCompleted: false,
      },
      {
        id: 2,
        title: "Task 2",
        description: "Description 2",
        isCompleted: true,
      },
    ]);
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks")
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("id", 1);
      expect(response.body[1]).toHaveProperty("id", 2);
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return task by id", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks/1")
        .expect(200);

      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("title", "Task 1");
      expect(response.body).toHaveProperty("description", "Description 1");
      expect(response.body).toHaveProperty("isCompleted", false);
    });

    it("should return 404 if task not found", async () => {
      await request(app.getHttpServer()).get("/tasks/999").expect(404);
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "New Task",
        description: "New Description",
        isCompleted: false,
      };

      const response = await request(app.getHttpServer())
        .post("/tasks")
        .send(newTask)
        .expect(201);

      // Проверяем ответ
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title", "New Task");
      expect(response.body).toHaveProperty("description", "New Description");
      expect(response.body).toHaveProperty("isCompleted", false);

      // Проверяем состояние базы данных
      const tasks = await repository.find();
      expect(tasks).toHaveLength(3);
      expect(tasks.find((task) => task.title === "New Task")).toBeTruthy();
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {
      const updateData = {
        title: "Updated Task",
        isCompleted: true,
      };

      const response = await request(app.getHttpServer())
        .patch("/tasks/1")
        .send(updateData)
        .expect(200);

      // Проверяем ответ
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("title", "Updated Task");
      expect(response.body).toHaveProperty("description", "Description 1");
      expect(response.body).toHaveProperty("isCompleted", true);

      // Проверяем состояние базы данных
      const task = await repository.findOneBy({ id: 1 });
      expect(task.title).toBe("Updated Task");
      expect(task.isCompleted).toBe(true);
    });

    it("should return 404 when updating non-existent task", async () => {
      const updateData = { title: "Non-existent Task" };

      await request(app.getHttpServer())
        .patch("/tasks/999")
        .send(updateData)
        .expect(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete an existing task", async () => {
      await request(app.getHttpServer()).delete("/tasks/1").expect(200);

      // Проверяем состояние базы данных
      const tasks = await repository.find();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(2); // Остался только Task 2

      // Повторная попытка получить удаленную задачу
      await request(app.getHttpServer()).get("/tasks/1").expect(404);
    });

    it("should return 404 when deleting non-existent task", async () => {
      await request(app.getHttpServer()).delete("/tasks/999").expect(404);
    });
  });
});
