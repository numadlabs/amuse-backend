import request from "supertest";
import app from "../../../src/app";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import {
  generateRefreshToken,
  generateVerificationToken,
} from "../../../src/utils/jwt";
import { faker } from "@faker-js/faker";
import { sendEmail } from "../../../src/lib/emailHelper";
import { userServices } from "../../../src/services/userServices";
import { testHelpers } from "../helpers/testHelpers";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/lib/emailHelper");

describe("Auth APIs", () => {
  describe("POST /api/auth/login", () => {
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        userId = result.result.user.id;
        email = result.result.user.email;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexisting@email.com",
        password: password,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: email,
        password: "wrongPassword12",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully log-in a user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: email,
        password: password,
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
        email: faker.internet.email(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/checkOTP", () => {
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string,
      verificationCode: number;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        email = result.result.user.email;
        userId = result.result.user.id;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
      verificationCode = faker.number.int({ min: 1000, max: 9999 });
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).post("/api/auth/checkOTP").send({
        email: "invalid@gmail.com",
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const response = await request(app).post("/api/auth/checkOTP").send({
        email: email,
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/checkOTP").send({
        email: email,
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/register", () => {
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string,
      verificationCode: number;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        email = result.result.user.email;
        userId = result.result.user.id;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
      verificationCode = faker.number.int({ min: 1000, max: 9999 });
    });

    it("should fail on unexpected fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        verificationCode: verificationCode,
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
        email: email,
        password: faker.internet.password(),
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail if email has already been registed", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const payload = {
        nickname: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
        verificationCode: verificationCode,
      };
      const user = await userServices.create(
        payload.email,
        payload.password,
        payload.nickname,
        payload.verificationCode
      );

      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: user.user.email,
        password: faker.internet.password(),
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully register a user", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).post("/api/auth/register").send({
        nickname: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
        verificationCode: verificationCode,
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
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string,
      verificationCode: number;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        email = result.result.user.email;
        userId = result.result.user.id;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
      verificationCode = faker.number.int({ min: 1000, max: 9999 });
    });

    it("should fail on invalid email", async () => {
      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: "invalid@gmail.com",
        verificationCode: verificationCode,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: email,
        verificationCode: 9999, //invalid verification code, different from mockResolvedValue
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password given valid verificationCode", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await request(app).put("/api/auth/forgotPassword").send({
        email: email,
        verificationCode: verificationCode,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/checkEmail", () => {
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string,
      verificationCode: number;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        email = result.result.user.email;
        userId = result.result.user.id;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
      verificationCode = faker.number.int({ min: 1000, max: 9999 });
    });

    it("should fail on already registered email", async () => {
      const response = await request(app).post("/api/auth/checkEmail").send({
        email: email,
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
    let userId: string,
      userAccessToken: string,
      password: string,
      email: string,
      verificationCode: number;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (
        typeof result.result.user.id === "string" &&
        typeof result.result.user.email === "string"
      ) {
        email = result.result.user.email;
        userId = result.result.user.id;
      }

      userAccessToken = result.result.accessToken;
      password = result.password;
      verificationCode = faker.number.int({ min: 1000, max: 9999 });

      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });
    });

    it('should fail on "Authorization" header not provided', async () => {
      const response = await request(app).put("/api/auth/changePassword").send({
        currentPassword: password,
        newPassword: faker.internet.password(),
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong currentPassword", async () => {
      const response = await request(app)
        .put("/api/auth/changePassword")
        .set("Authorization", `Bearer ${userAccessToken}`)
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
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({
          currentPassword: password,
          newPassword: faker.internet.password(),
        });

      console.error(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
