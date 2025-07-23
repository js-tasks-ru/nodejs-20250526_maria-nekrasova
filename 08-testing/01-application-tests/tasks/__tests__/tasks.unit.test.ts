import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "../tasks.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Task } from "../entities/task.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";

describe("TasksService", () => {
  let service: TasksService;
  let repository: jest.Mocked<{
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    remove: jest.Mock;
  }>;

  const mockTasksRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task)) as typeof repository;

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const dto: CreateTaskDto = {
        title: "Test Title",
        description: "Test Description",
      };
      const task = { id: 1, ...dto, isCompleted: false };

      repository.create.mockReturnValue(task as Task);
      repository.save.mockResolvedValue(task as Task);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(task);
      expect(result).toEqual(task);
    });
  });

  describe("findAll", () => {
    it("should return an array of tasks", async () => {
      const tasks = [
        { id: 1, title: "T1", description: "D1", isCompleted: false },
      ];
      repository.find.mockResolvedValue(tasks as Task[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(tasks);
    });
  });

  describe("findOne", () => {
    it("should return a task when it exists", async () => {
      const task = { id: 1, title: "T1", description: "D1", isCompleted: false };
      repository.findOneBy.mockResolvedValue(task as Task);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(task);
    });

    it("should throw NotFoundException when task does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a task when it exists", async () => {
      const existingTask = { id: 1, title: "Old", description: "Old", isCompleted: false };
      const updateDto: UpdateTaskDto = { isCompleted: true };
      const updatedTask = { ...existingTask, ...updateDto };

      repository.findOneBy.mockResolvedValue(existingTask as Task);
      repository.save.mockResolvedValue(updatedTask as Task);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTask);
    });

    it("should throw NotFoundException when task to update does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.update(999, { isCompleted: true })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a task when it exists", async () => {
      const task = { id: 1, title: "T", description: "D", isCompleted: false };

      repository.findOneBy.mockResolvedValue(task as Task);
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(task);
    });

    it("should throw NotFoundException when task to remove does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
