import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { io, Socket } from "socket.io-client";
import { JwtService } from "@nestjs/jwt";
import * as request from "supertest";
import { ChatService } from "../chat/chat.service";
import { AppModule } from "../app.module";
import { Repository } from "typeorm";
import { Message } from "../chat/entities/message.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("ChatGateway", () => {
  let app: INestApplication;
  let socket: Socket;
  let jwtService: JwtService;
  let repository: Repository<Message>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    jwtService = moduleRef.get<JwtService>(JwtService);
    repository = moduleRef.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    await app.listen(0);
  });

  afterAll(async () => {
    socket.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await app.close();
  });

  beforeEach(async () => {
    await repository.clear();

    // Seed the repository with test data
    await repository.save({
      id: 999,
      username: "testuser",
      text: "Привет, мир",
      date: new Date(),
    });
  });

  afterEach(async () => {
    socket.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  const createSocketClient = (token?: string): Socket => {
    const address = app.getHttpServer().address();
    const host = `http://127.0.0.1:${address.port}`;

    socket = io(host, {
      auth: {
        token: token || null,
      },
      transports: ["websocket"],
      reconnection: false,
      autoConnect: false,
      timeout: 500,
      forceNew: true,
    });
    return socket;
  };

  const generateValidToken = (username: string = "testuser") => {
    return jwtService.sign({ username, sub: "user-123" });
  };

  describe("WebSocket соединение", () => {
    it("Должен отключать клиента без токена", (done) => {
      const client = createSocketClient();

      client.on("disconnect", () => {
        done();
      });

      client.connect();
    });

    it("Должен подключать клиента с валидным токеном", (done) => {
      const validToken = generateValidToken();
      const client = createSocketClient(validToken);

      client.on("connect", () => {
        expect(client.connected).toBe(true);
        done();
      });

      client.connect();
    });

    it("Должен передавать сообщение другим пользователям", (done) => {
      const validToken1 = generateValidToken("user1");
      const client1 = createSocketClient(validToken1);

      const validToken2 = generateValidToken("user2");
      const client2 = createSocketClient(validToken2);

      client1.connect();

      // Wait for first client to connect, then connect second
      client1.on("connect", () => {
        client2.connect();

        // Second client should receive broadcast about user1
        client1.on("message", (data) => {
          expect(data.username).toBe("System");
          expect(data.text).toContain("user2");
          expect(data.text).toContain("joined the chat");
          client1.disconnect();
          client2.disconnect();
          done();
        });
      });
    });

    it("Сообщение из вебсокета должно сохраняться в базе данных", (done) => {
      const validToken = generateValidToken("testuser");
      const client = createSocketClient(validToken);
      const testMessage = { text: "Тестовое сообщение" };

      client.on("connect", () => {
        // Отправляем сообщение
        client.emit("chatMessage", testMessage);

        // Проверяем, что сообщение сохранилось в базе данных
        setTimeout(async () => {
          const messages = await repository.find({
            where: { text: "Тестовое сообщение" },
          });

          expect(messages.length).toBe(1);
          expect(messages[0]).toHaveProperty("username", "testuser");
          expect(messages[0]).toHaveProperty("text", "Тестовое сообщение");
          done();
        }, 100);
      });

      client.connect();
    });
  });

  describe("ChatController (e2e)", () => {
    it("GET /chat/history - доступен только для аутентифицированных пользователей", () => {
      return request(app.getHttpServer()).get("/chat/history").expect(401);
    });

    it("GET /chat/history - должен возвращать историю сообщений", async () => {
      const validToken = generateValidToken();

      const response = await request(app.getHttpServer())
        .get("/chat/history")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty("id", 999);
      expect(response.body[0]).toHaveProperty("username", "testuser");
      expect(response.body[0]).toHaveProperty("text", "Привет, мир");
      expect(response.body[0]).toHaveProperty("date");

      const messages = await repository.find();
      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe(999);
    });
  });
});
