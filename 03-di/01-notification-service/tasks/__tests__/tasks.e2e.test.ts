import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { TaskStatus } from "../task.model";
import { TasksService } from "../tasks.service";
import { NotificationsService } from "../../notifications/notifications.service";

describe("TasksModule (e2e)", () => {
  let app: INestApplication;
  let tasksService: TasksService;
  let notificationService: NotificationsService;

  // Mock NotificationService
  const mockNotificationService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendSMS: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NotificationsService)
      .useValue(mockNotificationService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksService = moduleFixture.get<TasksService>(TasksService);
    notificationService =
      moduleFixture.get<NotificationsService>(NotificationsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    (tasksService as any).tasks = [];
    mockNotificationService.sendEmail.mockClear();
    mockNotificationService.sendSMS.mockClear();
  });

  it("POST /tasks (should create a new task and send email notification)", async () => {
    const newTask = {
      title: "New Task",
      description: "Test task creation",
      assignedTo: 1,
    };

    const response = await request(app.getHttpServer())
      .post("/tasks")
      .send(newTask)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        title: "New Task",
        description: "Test task creation",
        status: TaskStatus.Pending,
        assignedTo: 1,
      }),
    );

    expect(notificationService.sendEmail).toHaveBeenCalledWith(
      "user1@mail.com",
      "Новая задача",
      'Вы назначены ответственным за задачу: "New Task"',
    );

    const tasks = (tasksService as any).tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0]).toEqual(
      expect.objectContaining({
        title: "New Task",
        assignedTo: 1,
      }),
    );
  });

  it("PATCH /tasks/:id (should update task and send SMS notification)", async () => {
    (tasksService as any).tasks = [
      {
        id: "1",
        title: "Existing Task",
        description: "Test description",
        status: TaskStatus.Pending,
        assignedTo: 2,
      },
    ];

    const updatedTask = {
      status: TaskStatus.Completed,
    };

    const response = await request(app.getHttpServer())
      .patch("/tasks/1")
      .send(updatedTask)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: "1",
        status: TaskStatus.Completed,
      }),
    );

    expect(notificationService.sendSMS).toHaveBeenCalledWith(
      "+987654321",
      'Статус задачи "Existing Task" обновлён на "completed"',
    );

    const tasks = (tasksService as any).tasks;
    expect(tasks[0]).toEqual(
      expect.objectContaining({
        id: "1",
        status: TaskStatus.Completed,
      }),
    );
  });

  it("PATCH /tasks/:id (should return 404 for non-existent task)", async () => {
    const updatedTask = {
      status: TaskStatus.Completed,
    };

    await request(app.getHttpServer())
      .patch("/tasks/999")
      .send(updatedTask)
      .expect(404);

    expect(notificationService.sendSMS).not.toHaveBeenCalled();
  });
});
