import request from "supertest";
import app from "../../../src/app";
import { userRepository } from "../../../src/repository/userRepository";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import {
  generateRefreshToken,
  generateTokens,
  generateVerificationToken,
} from "../../../src/utils/jwt";
import { faker } from "@faker-js/faker";
import { sendEmail } from "../../../src/lib/emailHelper";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/lib/emailHelper", () => ({
  sendEmail: jest.fn().mockResolvedValue({
    accepted: true,
  }),
}));

describe("Auth Controller", () => {
  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      await userRepository.create({
        email: "gombochir.dev@gmail.com",
        password:
          "$2a$10$zTI8T4tIUdJYoO1pxvbcyOjQay1Q6b9uL9BnAQTxto64MRwIvrDaa", // Password12 in bcrypt
        nickname: "test data",
        userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
      });
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexisting@email.com",
        password: "Password12",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "gombochir.dev@gmail.com",
        password: "wrongPassword12",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully log-in a user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "gombochir.dev@gmail.com",
        password: "Password12",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/sendOTP", () => {
    it("should fail on invalid email format", async () => {
      const response = await request(app).post("/api/auth/sendOTP").send({
        email: "invalidformat.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully send OTP", async () => {
      const response = await request(app).post("/api/auth/sendOTP").send({
        email: "gombochir.dev@gmail.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/checkOTP", () => {
    it("should fail on invalid email", async () => {
      const response = await request(app).post("/api/auth/checkOTP").send({
        email: "invalid@gmail.com",
        verificationCode: 1234,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: "gombochir.dev@gmail.com",
        verificationCode: 9999,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: "gombochir.dev@gmail.com",
        verificationCode: 1234,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/register", () => {
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on unexpected fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: "gombochir.dev@gmail.com",
        password: faker.internet.password(),
        verificationCode: 1234,
        balance: 100,
        visitCount: 10,
        userTierId: "invalid-id",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: "gombochir.dev@gmail.com",
        password: faker.internet.password(),
        verificationCode: 1000,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully register a user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: "gombochir.dev@gmail.com",
        password: faker.internet.password(),
        verificationCode: 1234,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/refreshToken", () => {
    it("should fail on invalid refreshToken", async () => {
      const response = await request(app).post("/api/auth/refreshToken").send({
        refreshToken: faker.internet.domainWord(),
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully provide accessToken.", async () => {
      const response = await request(app)
        .post("/api/auth/refreshToken")
        .send({
          refreshToken: generateRefreshToken({
            id: faker.string.uuid(),
            role: "USER",
            email: faker.internet.email(),
            userTierId: faker.string.uuid(),
            password: faker.internet.password(),
            nickname: faker.internet.userName(),
          }),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/forgotPassword", () => {
    beforeAll(async () => {
      await userRepository.create({
        email: "gombochir.dev@gmail.com",
        password:
          "$2a$10$zTI8T4tIUdJYoO1pxvbcyOjQay1Q6b9uL9BnAQTxto64MRwIvrDaa", // Password12 in bcrypt
        nickname: "test data",
        userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
      });
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "invalid@gmail.com",
        verificationCode: 1234,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "gombochir.dev@gmail.com",
        verificationCode: 9999,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password given valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "gombochir.dev@gmail.com",
        verificationCode: 1234,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/checkEmail", () => {
    beforeAll(async () => {
      await userRepository.create({
        email: "gombochir.dev@gmail.com",
        password:
          "$2a$10$zTI8T4tIUdJYoO1pxvbcyOjQay1Q6b9uL9BnAQTxto64MRwIvrDaa", // Password12 in bcrypt
        nickname: "test data",
        userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
      });
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on already registered email", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: "gombochir.dev@gmail.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check given unregistered email", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: "unregistered@gmail.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/auth/changePassword", () => {
    let user, accessToken: string;
    beforeAll(async () => {
      user = await userRepository.create({
        email: "gombochir.dev@gmail.com",
        password:
          "$2a$10$zTI8T4tIUdJYoO1pxvbcyOjQay1Q6b9uL9BnAQTxto64MRwIvrDaa", // Password12 in bcrypt
        nickname: "test data",
        userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
      });

      accessToken = generateTokens(user).accessToken;
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it('should fail on "Authorization" header not provided', async () => {
      const response = await request(app).put("/api/auth/changePassword").send({
        currentPassword: "Password12",
        newPassword: "Password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong currentPassword", async () => {
      const response = await request(app)
        .put("/api/auth/changePassword")
        .send({
          currentPassword: "invalidPassword12",
          newPassword: "Password123",
        })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password", async () => {
      const response = await request(app)
        .put("/api/auth/changePassword")
        .send({
          currentPassword: "Password12",
          newPassword: "Password123",
        })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
