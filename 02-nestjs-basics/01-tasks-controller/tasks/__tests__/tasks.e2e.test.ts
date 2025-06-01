import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { TasksService } from "../tasks.service";
import { TaskStatus } from "../task.model";

describe("TasksModule (e2e)", () => {
  let app: INestApplication;
  let tasksService: TasksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksService = app.get(TasksService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    // Clear tasks array after each test
    tasksService["tasks"] = [];
  });

  it("GET /tasks (should return an empty array)", () => {
    return request(app.getHttpServer()).get("/tasks").expect(200).expect([]);
  });

  it("POST /tasks (should create a new task)", async () => {
    const newTask = {
      title: "Test Task",
      description: "This is a test task",
      status: TaskStatus.PENDING,
    };

    const response = await request(app.getHttpServer())
      .post("/tasks")
      .send(newTask)
      .expect(201);

    expect(response.body).toMatchObject(newTask);
    expect(response.body).toHaveProperty("id");

    expect(
      tasksService["tasks"].find((t) => t.id === response.body.id),
    ).toMatchObject({ id: response.body.id, ...newTask });
  });

  it("GET /tasks/:id (should return the created task)", async () => {
    const task = {
      id: "1",
      title: "Another Test Task",
      description: "Another description",
      status: TaskStatus.PENDING,
    };
    tasksService["tasks"].push(task);

    const response = await request(app.getHttpServer())
      .get(`/tasks/${task.id}`)
      .expect(200);

    expect(response.body).toMatchObject(task);
    expect(response.body).toHaveProperty("id");
  });

  it("PATCH /tasks/:id (should update the task)", async () => {
    const task = {
      id: "1",
      title: "Task to Update",
      description: "Task before update",
      status: TaskStatus.PENDING,
    };
    tasksService["tasks"].push(task);

    const updatedTask = {
      title: "Updated Task",
      description: "Task after update",
      status: TaskStatus.COMPLETED,
    };

    const updateResponse = await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send(updatedTask)
      .expect(200);

    expect(updateResponse.body).toMatchObject(updatedTask);
    expect(updateResponse.body).toHaveProperty("id");

    expect(
      tasksService["tasks"].find((t) => t.id === updateResponse.body.id),
    ).toMatchObject({ id: updateResponse.body.id, ...updatedTask });
  });

  it("DELETE /tasks/:id (should delete the task)", async () => {
    const task = {
      id: "1",
      title: "Task to Delete",
      description: "This task will be deleted",
      status: TaskStatus.PENDING,
    };
    tasksService["tasks"].push(task);

    const response = await request(app.getHttpServer())
      .delete(`/tasks/${task.id}`)
      .expect(200);
    expect(response.body).toMatchObject(task);
    expect(response.body).toHaveProperty("id");

    expect(
      tasksService["tasks"].find((t) => t.id === response.body.id),
    ).toBeUndefined();

    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(404);
  });

  it("GET /tasks/:id (should return 404 for non-existent task)", () => {
    return request(app.getHttpServer())
      .get("/tasks/non-existent-id")
      .expect(404);
  });
});
