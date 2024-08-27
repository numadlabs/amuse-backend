import { faker } from "@faker-js/faker";
import { testHelpers } from "../helpers/testHelpers";
import supertest from "supertest";
import app from "../../../src/app";
import { sendEmail } from "../../../src/lib/emailHelper";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { generateVerificationToken } from "../../../src/utils/jwt";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/lib/emailHelper");

describe("Employee APIs", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /api/employees", () => {
    it("should successfully register an employee", async () => {
      const { restaurantId, ownerAccessToken } =
        await testHelpers.createRestaurant();
      const employeePayload = {
        email: faker.internet.email().toLowerCase(),
        firstname: faker.company.name(),
        lastname: "employee",
        role: "RESTAURANT_WAITER",
        restaurantId: restaurantId,
      };
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const response = await supertest(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .send(employeePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/employees/login", () => {
    it("should successfully login an employee", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app).post("/api/employees/login").send({
        email: employee.employee.email,
        password: employee.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/sendOTP", () => {
    it("should successfully send an OTP", async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .post("/api/employees/sendOTP")
        .send({
          email: employee.employee.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/employees/checkOTP", () => {
    it("should successfully check an OTP", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .post("/api/employees/checkOTP")
        .send({
          email: employee.employee.email,
          verificationCode: 1234,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("POST /api/employees/forgotPassword", () => {
    it("should successfully change password", async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(1234, "1h"),
        isUsed: false,
      });
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .post("/api/employees/forgotPassword")
        .send({
          email: employee.employee.email,
          verificationCode: 1234,
          password: faker.internet.password(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("POST /api/employees/check-password", () => {
    it("should successfully check password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .post("/api/employees/check-password")
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          currentPassword: employee.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/changePassword", () => {
    it("should successfully change password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .put("/api/employees/changePassword")
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          currentPassword: employee.password,
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("GET /api/employees/:restaurantId/restaurant", () => {
    it("should successfully return list of restaurant's employees", async () => {
      const { restaurantId, ownerAccessToken } =
        await testHelpers.createRestaurant();
      const employee = await testHelpers.createEmployee(
        restaurantId,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/employees/${restaurantId}/restaurant`)
        .set("Authorization", `Bearer ${ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
  describe("GET /api/employees/:id", () => {
    it("should successfully return an employee", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("PUT /api/employees/:id", () => {
    it("should successfully update an employee", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          firstname: faker.company.name(),
          lastname: "updated employee",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("PUT /api/employees/:id/role", () => {
    it("should successfully update employee's role", async () => {
      const { restaurantId, ownerAccessToken } =
        await testHelpers.createRestaurant();
      const employee = await testHelpers.createEmployee(
        restaurantId,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/role`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .send({
          role: "RESTAURANT_WAITER",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("PUT /api/employees/:id/remove-from-restaurant", () => {
    it("should successfully remove employee from the restaurant", async () => {
      const { restaurantId, ownerAccessToken } =
        await testHelpers.createRestaurant();
      const employee = await testHelpers.createEmployee(
        restaurantId,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/remove-from-restaurant`)
        .set("Authorization", `Bearer ${ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
