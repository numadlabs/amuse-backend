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
  describe("POST /api/employees", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app).post("/api/employees").send({
        email: faker.internet.email(),
        fullname: faker.company.name(),
        role: "RESTAURANT_WAITER",
        restaurantId: restaurant.data.id,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${waiter.accessToken}`)
        .send({
          email: faker.internet.email(),
          fullname: faker.company.name(),
          role: "RESTAURANT_WAITER",
          restaurantId: restaurant.data.id,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const differentRestaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`)
        .send({
          email: faker.internet.email(),
          fullname: faker.company.name(),
          role: "RESTAURANT_WAITER",
          restaurantId: restaurant.data.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully register an employee", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const response = await supertest(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          email: faker.internet.email(),
          fullname: faker.company.name(),
          role: "RESTAURANT_WAITER",
          restaurantId: restaurant.data.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/employees/login", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app).post("/api/employees/login").send({
        email: faker.internet.email(),
        password: employee.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app).post("/api/employees/login").send({
        email: employee.employee.email,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully login an employee", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app).post("/api/employees/login").send({
        email: employee.employee.email,
        password: employee.password,
      });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/sendOTP", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email format", async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const response = await supertest(app)
        .post("/api/employees/sendOTP")
        .send({
          email: "invalidEmailFormat.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(sendEmail).toHaveBeenCalledTimes(0);
    });

    it("should fail on invalid email", async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

      const response = await supertest(app)
        .post("/api/employees/sendOTP")
        .send({
          email: "unregisteredEmail@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(sendEmail).toHaveBeenCalledTimes(0);
    });

    it("should successfully send an OTP", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );
      (sendEmail as jest.Mock).mockResolvedValue({ accepted: true });

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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/checkOTP")
        .send({
          email: "unregisteredEmail@gmail.com",
          verificationCode: verificationCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/checkOTP")
        .send({
          email: faker.internet.email(),
          verificationCode: invalidVerificationCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully check an OTP", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/checkOTP")
        .send({
          email: employee.employee.email,
          verificationCode: verificationCode,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/forgotPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail on invalid email", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/forgotPassword")
        .send({
          email: "unregisteredEmail@gmail.com",
          verificationCode: verificationCode,
          password: faker.internet.password(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verification code", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/forgotPassword")
        .send({
          email: faker.internet.email(),
          verificationCode: invalidVerificationCode,
          password: faker.internet.password(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully change password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .post("/api/employees/forgotPassword")
        .send({
          email: employee.employee.email,
          verificationCode: verificationCode,
          password: faker.internet.password(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/check-password", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .post("/api/employees/check-password")
        .send({
          currentPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post("/api/employees/check-password")
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          currentPassword: user.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );
      const wrongPassword = faker.internet.password();
      expect(employee.password).not.toBe(wrongPassword);

      const response = await supertest(app)
        .post("/api/employees/check-password")
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          currentPassword: wrongPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

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

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/employees/changePassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .put("/api/employees/changePassword")
        .send({
          currentPassword: faker.internet.password(),
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .put("/api/employees/changePassword")
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          currentPassword: user.password,
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on wrong password", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );
      const wrongPassword = faker.internet.password();
      expect(employee.password).not.toBe(wrongPassword);

      const response = await supertest(app)
        .put("/api/employees/changePassword")
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          currentPassword: wrongPassword,
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

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

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/employees/:restaurantId/restaurant", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app).get(
        `/api/employees/${restaurant.data.id}/restaurant`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .get(`/api/employees/${restaurant.data.id}/restaurant`)
        .set("Authorization", `Bearer ${waiter.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const differentRestaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/employees/${restaurant.data.id}/restaurant`)
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return list of restaurant's employees", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/employees/${restaurant.data.id}/restaurant`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe("GET /api/employees/:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app).get(
        `/api/employees/${employee.employee.id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}`)
        .send({
          fullname: faker.company.name(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          fullname: faker.company.name(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ID)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );
      const differentEmployee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${differentEmployee.accessToken}`)
        .send({
          fullname: faker.company.name(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update an employee", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}`)
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          fullname: faker.company.name(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/employees/:id/role", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/role`)
        .send({
          role: "RESTAURANT_WAITER",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/role`)
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          role: "RESTAURANT_WAITER",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );
      const differentRestaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/role`)
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`)
        .send({
          role: "RESTAURANT_WAITER",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update employee's role", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/role`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          role: "RESTAURANT_WAITER",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/employees/:id/remove-from-restaurant", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app).put(
        `/api/employees/${employee.employee.id}/remove-from-restaurant`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/remove-from-restaurant`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );
      const differentRestaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/remove-from-restaurant`)
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully remove employee from the restaurant", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const employee = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .put(`/api/employees/${employee.employee.id}/remove-from-restaurant`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
