import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { getModelToken } from "@nestjs/mongoose";
import { Task } from "../schemas/task.schema";
import { Model } from "mongoose";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let taskModel: Model<Task>;

  beforeAll(async () => {
    // Create the testing module using your main AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create and initialize the Nest application
    app = moduleFixture.createNestApplication();
    await app.init();

    // Retrieve the Task model from the module container
    taskModel = moduleFixture.get<Model<Task>>(getModelToken(Task.name));
  });

  afterAll(async () => {
    // Gracefully shut down the application after all tests
    await app.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await taskModel.deleteMany({});

    // Insert test data
    await taskModel.insertMany([
      {
        title: "Task 1",
        description: "task 1 description",
        isCompleted: false,
      },
      {
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

      // We inserted 2 tasks in beforeEach, so we expect an array of length 2
      expect(response.body).toHaveLength(2);

      // You can further verify the structure of the tasks
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Task 1",
            description: "task 1 description",
            isCompleted: false,
          }),
          expect.objectContaining({
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
      // Fetch the existing document from the DB to retrieve a valid _id
      const task = await taskModel.findOne({ title: "Task 1" });
      const response = await request(app.getHttpServer())
        .get(`/tasks/${task._id}`)
        .expect(200);

      // Check the response to ensure the correct document is returned
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: task._id.toString(),
          title: "Task 1",
          description: "task 1 description",
          isCompleted: false,
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      // A random, valid ObjectId that doesn't exist
      const nonExistentId = "64f1fa9ee98c12e3ecb14f96";
      await request(app.getHttpServer())
        .get(`/tasks/${nonExistentId}`)
        .expect(404);
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

      // The response body should contain the newly created task
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: "New Task",
          description: "new task description",
          isCompleted: false,
        }),
      );

      // Verify the database has the new task
      const tasks = await taskModel.find();
      expect(tasks.length).toBe(3);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {
      const task = await taskModel.findOne({ title: "Task 1" });

      const update = {
        title: "Updated Task",
        description: "updated task description",
        isCompleted: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task._id}`)
        .send(update)
        .expect(200);

      // The response body should reflect the updated fields
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: task._id.toString(),
          title: "Updated Task",
          description: "updated task description",
          isCompleted: true,
        }),
      );

      // Double-check the DB
      const updatedTaskInDb = await taskModel.findById(task._id);
      expect(updatedTaskInDb).toEqual(
        expect.objectContaining({
          title: "Updated Task",
          description: "updated task description",
          isCompleted: true,
        }),
      );
    });

    it("should return 404 if task not found", async () => {
      const nonExistentId = "64f1fa9ee98c12e3ecb14f96";
      await request(app.getHttpServer())
        .patch(`/tasks/${nonExistentId}`)
        .send({ title: "Some update" })
        .expect(404);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await taskModel.findOne({ title: "Task 1" });

      // Delete the task
      await request(app.getHttpServer())
        .delete(`/tasks/${task._id}`)
        .expect(200);

      // Ensure there is only 1 task left in the DB
      const tasks = await taskModel.find();
      expect(tasks.length).toBe(1);
    });

    it("should return 404 if task not found", async () => {
      const nonExistentId = "64f1fa9ee98c12e3ecb14f96";
      await request(app.getHttpServer())
        .delete(`/tasks/${nonExistentId}`)
        .expect(404);
    });
  });
});
