import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../app.module";
import { UsersService } from "../users/users.service";
import { GoogleStrategy } from "../auth/passport/google.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Profile } from "passport-google-oauth20";

// Mock user data that simulates Google's response
const mockGoogleProfile = {
  id: "123456789",
  displayName: "Test User",
  photos: [{ value: "https://example.com/photo.jpg" }],
  provider: "google",
  _raw: "",
  _json: {},
} as Profile;

// override authenticate method to avoid requests to google
class MockGoogleStrategy extends GoogleStrategy {
  async authenticate(req: any) {
    if (req.url === "/auth/google") {
      this.redirect("https://accounts.google.com/o/oauth2/v2/auth");
    } else {
      const result = await super.validate(
        "accessToken",
        "refreshToken",
        mockGoogleProfile,
      );
      this.success(result);
    }
  }
}

describe("Authentication (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [User],
          synchronize: true,
        }),
        AppModule,
      ],
    })
      .overrideProvider(GoogleStrategy)
      .useClass(MockGoogleStrategy)
      .compile();

    app = moduleRef.createNestApplication();
    jwtService = moduleRef.get<JwtService>(JwtService);
    usersService = moduleRef.get<UsersService>(UsersService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const repository = app.get("UserRepository");
    await repository.clear();
  });

  describe("Google Authentication Flow", () => {
    it("should redirect to Google login", () => {
      return request(app.getHttpServer()).get("/auth/google").expect(302);
    });

    it("should handle Google callback with user creation", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/google/callback")
        .query({
          code: "mock-auth-code",
        })
        .expect(200);

      // Verify response contains HTML with token
      expect(response.text).toContain("localStorage.setItem('token'");
      expect(response.text).toContain("window.location.href");

      // Extract token from response
      const tokenMatch = response.text.match(
        /localStorage\.setItem\('token', '(.+?)'\)/,
      );
      expect(tokenMatch).toBeTruthy();
      const token = tokenMatch[1];

      // Verify token is valid JWT
      const decodedToken = jwtService.verify(token, {
        secret: "killer-is-jim",
      });
      expect(decodedToken).toBeDefined();
      expect(decodedToken.sub).toBe(mockGoogleProfile.id);

      // Verify user was created
      const user = await usersService.findOne(mockGoogleProfile.id);
      expect(user).toBeDefined();
      expect(user.displayName).toBe(mockGoogleProfile.displayName);
      expect(user.avatar).toBe(mockGoogleProfile.photos[0].value);
    });

    it("should handle Google callback for existing user", async () => {
      // Create user first
      await usersService.create({
        id: mockGoogleProfile.id,
        displayName: mockGoogleProfile.displayName,
        avatar: mockGoogleProfile.photos[0].value,
      });

      const response = await request(app.getHttpServer())
        .get("/auth/google/callback")
        .query({
          code: "mock-auth-code",
          state: "mock-state",
        })
        .expect(200);

      expect(response.text).toContain("localStorage.setItem('token'");
    });
  });

  it("should handle expired tokens", async () => {
    const expiredToken = jwtService.sign(
      { sub: mockGoogleProfile.id },
      { secret: "killer-is-jim", expiresIn: "0s" },
    );

    await request(app.getHttpServer())
      .get("/auth/profile")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);
  });

  it("should protect profile endpoint and return user data with valid token", async () => {
    const token = jwtService.sign(
      {
        sub: mockGoogleProfile.id,
        displayName: mockGoogleProfile.displayName,
        avatar: mockGoogleProfile.photos[0].value,
      },
      { secret: "killer-is-jim" },
    );

    const response = await request(app.getHttpServer())
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      sub: mockGoogleProfile.id,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it("should reject unauthorized profile access", () => {
    return request(app.getHttpServer()).get("/auth/profile").expect(401);
  });
});
