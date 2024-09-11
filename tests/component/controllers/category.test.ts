import supertest from "supertest";
import app from "../../../src/app";
import { faker } from "@faker-js/faker";
import { testHelpers } from "../helpers/testHelpers";

jest.mock("../../../src/repository/emailOtpRepository");

describe("Category APIs", () => {
  describe("GET /api/categories", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/categories`);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return list of categories", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/categories`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/categories", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .post(`/api/categories`)
        .send({ name: faker.commerce.department() });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not RESTAURANT_OWNER", async () => {
      const manager = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .post(`/api/categories`)
        .set("Authorization", `Bearer ${manager.accessToken}`)
        .send({ name: faker.commerce.department() });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully create new category", async () => {
      const owner = await testHelpers.createEmployee(null, "RESTAURANT_OWNER");

      const response = await supertest(app)
        .post(`/api/categories`)
        .set("Authorization", `Bearer ${owner.accessToken}`)
        .send({ name: faker.commerce.department() });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
