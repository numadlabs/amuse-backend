import request from "supertest";
import { testHelpers } from "../helpers/testHelpers";
import { faker } from "@faker-js/faker";
import { sendEmail } from "../../../src/lib/emailHelper";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import {
  generateRefreshToken,
  generateVerificationToken,
} from "../../../src/utils/jwt";
import app from "../../../src/app";
import generatePassword from "../helpers/passwordGenerator";

jest.mock("../../../src/lib/emailHelper");
jest.mock("../../../src/repository/emailOtpRepository");

describe("Auth APIs", () => {
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email format", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/login").send({
        email: "invalidEmailFormat.com",
        password: createdUser.password,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid password format", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/login").send({
        email: createdUser.user.email,
        password: "InvalidPasswordFormat",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong email", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/login").send({
        email: faker.internet.email(),
        password: createdUser.password,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/login").send({
        email: createdUser.user.email,
        password: generatePassword(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully log-in a user", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/login").send({
        email: createdUser.user.email,
        password: createdUser.password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.balance).toBe(0);
      expect(response.body.data.user.visitCount).toBe(0);
    });
  });

  describe("POST /api/auth/sendOTP", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email format", async () => {
      const response = await request(app).post("/api/auth/sendOTP").send({
        email: "invalidEmailFormat.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully send OTP", async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const response = await request(app).post("/api/auth/sendOTP").send({
        email: faker.internet.email(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/checkOTP", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email format", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: "invalidEmailFormat.com",
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verification code format", async () => {
      const response = await request(app).post("/api/auth/checkOTP").send({
        email: faker.internet.email(),
        verificationCode: 123,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: faker.internet.email(),
        verificationCode: invalidVerificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check valid verificationCode", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: faker.internet.email(),
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/register", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on unexpected fields", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: faker.internet.email(),
        password: generatePassword(),
        verificationCode: verificationCode,
        balance: 100,
        visitCount: 10,
        userTierId: faker.string.uuid(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);

      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: faker.internet.email(),
        password: generatePassword(),
        verificationCode: invalidVerificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail if email has already been registed", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      const existingUser = await testHelpers.createUserWithMockedOtp();
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/register").send({
        email: existingUser.user.email,
        nickname: faker.internet.userName(),
        password: generatePassword(),
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully register a user", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: faker.internet.email(),
        password: generatePassword(),
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/refreshToken", () => {
    it("should fail on invalid refreshToken", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJjZjlhZWFjLWIxNmMtNDg0Mi05OThkLWJmNzEyZjEyYjUyYSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzIyOTU0OTUwLCJleHAiOjE3MjI5OTgxNTB9.0a2qwlPzBGBhyNNAFvUkauwjnX7ztJD69-bbVxuXqz8";

      const response = await request(app).post("/api/auth/refreshToken").send({
        refreshToken: invalidToken,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully provide accessToken.", async () => {
      const refreshToken = generateRefreshToken({
        id: faker.string.uuid(),
        role: "USER",
        email: faker.internet.email(),
        userTierId: faker.string.uuid(),
        password: generatePassword(),
        nickname: faker.internet.userName(),
      });

      const response = await request(app).post("/api/auth/refreshToken").send({
        refreshToken: refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/forgotPassword", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "invalidEmail@gmail.com",
        verificationCode: verificationCode,
        password: generatePassword(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: createdUser.user.email,
        verificationCode: invalidVerificationCode,
        password: generatePassword(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password given valid verificationCode", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: createdUser.user.email,
        verificationCode: verificationCode,
        password: generatePassword(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/checkEmail", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email format", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: "invalidEmailFormat.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check given already registered email", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app).post("/api/auth/checkEmail").send({
        email: createdUser.user.email,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isEmailRegistered).toBe(true);
    });

    it("should successfully check given unregistered email", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: faker.internet.email(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isEmailRegistered).toBe(false);
    });
  });

  describe("PUT /api/auth/changePassword", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await request(app).put("/api/auth/changePassword").send({
        currentPassword: generatePassword(),
        newPassword: generatePassword(),
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong currentPassword", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app)
        .put("/api/auth/changePassword")
        .set("Authorization", `Bearer ${createdUser.accessToken}`)
        .send({
          currentPassword: "wrongPassword12",
          newPassword: generatePassword(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password", async () => {
      const createdUser = await testHelpers.createUserWithMockedOtp();

      const response = await request(app)
        .put("/api/auth/changePassword")
        .set("Authorization", `Bearer ${createdUser.accessToken}`)
        .send({
          currentPassword: createdUser.password,
          newPassword: generatePassword(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
