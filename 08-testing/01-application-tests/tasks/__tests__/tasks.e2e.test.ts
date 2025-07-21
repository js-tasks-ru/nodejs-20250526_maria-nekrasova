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

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(async () => {});

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {});
  });

  describe("GET /tasks/:id", () => {
    it("should return task by id", async () => {});

    it("should return 404 if task not found", async () => {});
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {});
  });

  describe("PATCH /tasks/:id", () => {
    it("should update an existing task", async () => {});

    it("should return 404 when updating non-existent task", async () => {});
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete an existing task", async () => {});

    it("should return 404 when deleting non-existent task", async () => {});
  });
});
