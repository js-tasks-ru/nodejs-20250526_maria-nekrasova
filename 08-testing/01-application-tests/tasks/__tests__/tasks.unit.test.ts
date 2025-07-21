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

  beforeEach(async () => {});

  describe("create", () => {
    it("should create a new task", async () => {});
  });

  describe("findAll", () => {
    it("should return an array of tasks", async () => {});
  });

  describe("findOne", () => {
    it("should return a task when it exists", async () => {});

    it("should throw NotFoundException when task does not exist", async () => {});
  });

  describe("update", () => {
    it("should update a task when it exists", async () => {});

    it("should throw NotFoundException when task to update does not exist", async () => {});
  });

  describe("remove", () => {
    it("should remove a task when it exists", async () => {});

    it("should throw NotFoundException when task to remove does not exist", async () => {});
  });
});
