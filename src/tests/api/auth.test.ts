jest.mock("../../services/mail.service");

import crypto from "crypto";
import request from "supertest";
import app from "../../app";
import UserModel from "../../models/user.model";
import { sendPasswordResetEmail } from "../../services/mail.service";

const getRefreshToken = (response: request.Response): string | undefined => {
  const cookies = response.headers["set-cookie"];
  if (!cookies) return undefined;

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const refreshTokenCookie = cookieArray.find((cookie: string) =>
    cookie.startsWith("refreshToken=")
  );
  if (!refreshTokenCookie) return undefined;

  return refreshTokenCookie.split(";")[0].split("=")[1];
};

describe("/api/v1/auth", () => {
  const testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "Password@123",
  };

  const testUserBadEmail = {
    ...testUser,
    email: "invalid-email",
  };

  const testUserBadPassword = {
    ...testUser,
    password: "doesnotmeetcriteria",
  };

  describe("POST /register", () => {
    it("should fail registration with missing fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Incomplete User" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Name, email, and password are required"
      );
    });

    it("should register a new user with valid data", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();

      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user.email).toBe(testUser.email);

      expect(response.headers["set-cookie"][0]).toContain("refreshToken");

      const dbUser = await UserModel.findOne({ email: testUser.email });
      expect(dbUser).toBeDefined();
      expect(dbUser?.name).toBe(testUser.name);
    });

    it("should fail registration with existing email", async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should fail registration with invalid email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUserBadEmail);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Please fill a valid email");
    });

    it("should fail registration with weak password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUserBadPassword);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Password must");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
    });

    it("should log in a user with valid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();

      expect(response.headers["set-cookie"][0]).toContain("refreshToken");
    });

    it("should fail login with a non-existent email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email or password");
    });

    it("should fail login with a wrong password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email or password");
    });

    it("should fail login with a missing email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        password: testUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Email and password are required"
      );
    });

    it("should fail login with a missing password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Email and password are required"
      );
    });
  });

  describe("POST /auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      refreshToken = getRefreshToken(loginResponse) || "";
    });

    it("should refresh the access token with a valid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("should fail to refresh with no token", async () => {
      const response = await request(app).post("/api/v1/auth/refresh");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No refresh token provided");
    });

    it("should fail to refresh with an invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=fake-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Invalid or expired refresh token"
      );
    });
  });

  describe("POST /auth/logout", () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      refreshToken = getRefreshToken(loginResponse) || "";
    });

    it("should log out the user and clear the refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("User logged out successfully");

      expect(response.headers["set-cookie"][0]).toContain("refreshToken=;");

      const user = await UserModel.findOne({ email: testUser.email }).select(
        "+refreshToken"
      );
      expect(user?.refreshToken).toBeUndefined();
    });

    it("should return 200 even if no token is provided", async () => {
      const response = await request(app).post("/api/v1/auth/logout");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /auth/forgot-password", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      (sendPasswordResetEmail as jest.Mock).mockClear();
    });

    it("should send a reset email if the user exists", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("reset your password");

      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);

      const user = await UserModel.findOne({ email: testUser.email }).select(
        "+passwordResetToken"
      );
      expect(user?.passwordResetToken).toBeDefined();
    });

    it("should return 200 even if the user does not exist", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nouser@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("reset your password");

      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should fail with a 400 if no email is provided", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Email is required");
    });
  });

  describe("POST /auth/reset-password", () => {
    const plainToken = "my-plain-reset-token-123";
    let hashedToken: string;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);

      hashedToken = crypto
        .createHash("sha256")
        .update(plainToken)
        .digest("hex");

      await UserModel.findOneAndUpdate(
        { email: testUser.email },
        {
          passwordResetToken: hashedToken,
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        }
      );
    });

    it("should reset the password with a valid token", async () => {
      const newPassword = "NewPassword!456";
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: plainToken,
          newPassword: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers["set-cookie"][0]).toContain("refreshToken");

      const user = await UserModel.findOne({ email: testUser.email });
      expect(user?.passwordResetToken).toBeUndefined();

      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: newPassword });
      expect(loginResponse.status).toBe(200);
    });

    it("should fail with an invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: "invalid-token",
          newPassword: "NewPassword!456",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Invalid or expired password reset token"
      );
    });

    it("should fail with an expired token", async () => {
      await UserModel.findOneAndUpdate(
        { email: testUser.email },
        {
          passwordResetExpires: new Date(Date.now() - 10 * 60 * 1000),
        }
      );

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: plainToken,
          newPassword: "NewPassword!456",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Invalid or expired password reset token"
      );
    });
  });
});
