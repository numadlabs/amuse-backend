import request from "supertest";
import app from "../../../src/app";
import { userRepository } from "../../../src/repository/userRepository";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import {
  generateRefreshToken,
  generateVerificationToken,
} from "../../../src/utils/jwt";
import { faker } from "@faker-js/faker";
import { sendEmail } from "../../../src/lib/emailHelper";
import { userServices } from "../../../src/services/userServices";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/lib/emailHelper");

const userPayload = {
  email: "gombochir.dev@gmail.com",
  password: "Password12",
  nickname: "test data",
  verificationCode: 1234,
};

describe("Auth APIs", () => {
  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexisting@email.com",
        password: userPayload.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: userPayload.email,
        password: "wrongPassword12",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully log-in a user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: userPayload.email,
        password: userPayload.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/sendOTP", () => {
    beforeAll(async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });
    });

    it("should fail on invalid email format", async () => {
      const response = await request(app).post("/api/auth/sendOTP").send({
        email: "invalidformat.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully send OTP", async () => {
      const response = await request(app).post("/api/auth/sendOTP").send({
        email: userPayload.email,
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
        verificationCode: userPayload.verificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: userPayload.email,
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: userPayload.email,
        verificationCode: userPayload.verificationCode,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/register", () => {
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on unexpected fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: userPayload.email,
        password: faker.internet.password(),
        verificationCode: userPayload.verificationCode,
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
        email: userPayload.email,
        password: faker.internet.password(),
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully register a user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: userPayload.email,
        password: faker.internet.password(),
        verificationCode: userPayload.verificationCode,
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
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "invalid@gmail.com",
        verificationCode: userPayload.verificationCode,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "gombochir.dev@gmail.com",
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password given valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: userPayload.email,
        verificationCode: userPayload.verificationCode,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/checkEmail", () => {
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it("should fail on already registered email", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: userPayload.email,
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
    let accessToken: string;
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });

      accessToken = (
        await userServices.create(
          userPayload.email,
          userPayload.password,
          userPayload.nickname,
          userPayload.verificationCode
        )
      ).accessToken;
    });

    afterAll(async () => {
      await userRepository.cleanUp();
    });

    it('should fail on "Authorization" header not provided', async () => {
      const response = await request(app).put("/api/auth/changePassword").send({
        currentPassword: userPayload.password,
        newPassword: faker.internet.password(),
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong currentPassword", async () => {
      const response = await request(app)
        .put("/api/auth/changePassword")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          currentPassword: "invalidPassword12", //wrong password, different from userPayload
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password", async () => {
      const response = await request(app)
        .put("/api/auth/changePassword")
        .send({
          currentPassword: userPayload.password,
          newPassword: faker.internet.password(),
        })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
