import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "../tasks.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Task } from "../entities/task.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";

describe("TasksService", () => {
  let service: TasksService;
  let repository: Repository<Task>;

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
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: "Test Task",
        description: "Test Description",
      };

      const newTask = {
        id: 1,
        ...createTaskDto,
      };

      mockTasksRepository.create.mockReturnValue(newTask);
      mockTasksRepository.save.mockResolvedValue(newTask);

      // Act
      const result = await service.create(createTaskDto);

      // Assert
      expect(result).toEqual(newTask);
      expect(mockTasksRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockTasksRepository.save).toHaveBeenCalledWith(newTask);
    });
  });

  describe("findAll", () => {
    it("should return an array of tasks", async () => {
      // Arrange
      const tasks = [
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
      ];

      mockTasksRepository.find.mockResolvedValue(tasks);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(tasks);
      expect(mockTasksRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a task when it exists", async () => {
      // Arrange
      const taskId = 1;
      const task = {
        id: taskId,
        title: "Task 1",
        description: "Description 1",
        isCompleted: false,
      };

      mockTasksRepository.findOneBy.mockResolvedValue(task);

      // Act
      const result = await service.findOne(taskId);

      // Assert
      expect(result).toEqual(task);
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
    });

    it("should throw NotFoundException when task does not exist", async () => {
      // Arrange
      const taskId = 999;
      mockTasksRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
    });
  });

  describe("update", () => {
    it("should update a task when it exists", async () => {
      // Arrange
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: "Updated Task",
        isCompleted: true,
      };

      const existingTask = {
        id: taskId,
        title: "Task 1",
        description: "Description 1",
        isCompleted: false,
      };

      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
      };

      mockTasksRepository.findOneBy.mockResolvedValue(existingTask);
      mockTasksRepository.save.mockResolvedValue(updatedTask);

      // Act
      const result = await service.update(taskId, updateTaskDto);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
      expect(mockTasksRepository.save).toHaveBeenCalledWith(updatedTask);
    });

    it("should throw NotFoundException when task to update does not exist", async () => {
      // Arrange
      const taskId = 999;
      const updateTaskDto: UpdateTaskDto = {
        title: "Updated Task",
        isCompleted: false,
      };

      mockTasksRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(taskId, updateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
      expect(mockTasksRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove a task when it exists", async () => {
      // Arrange
      const taskId = 1;
      const task = {
        id: taskId,
        title: "Task 1",
        description: "Description 1",
        isCompleted: false,
      };

      mockTasksRepository.findOneBy.mockResolvedValue(task);

      // Act
      await service.remove(taskId);

      // Assert
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
      expect(mockTasksRepository.remove).toHaveBeenCalledWith(task);
    });

    it("should throw NotFoundException when task to remove does not exist", async () => {
      // Arrange
      const taskId = 999;
      mockTasksRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(taskId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.findOneBy).toHaveBeenCalledWith({
        id: taskId,
      });
      expect(mockTasksRepository.remove).not.toHaveBeenCalled();
    });
  });
});
