import supertest from "supertest";
import app from "../../../src/app";
import { testHelpers } from "../helpers/testHelpers";
import { faker } from "@faker-js/faker";
import { userTierRepository } from "../../../src/repository/userTierRepository";

jest.mock("../../../src/repository/emailOtpRepository");

describe("User Tier APIs", () => {
  describe("GET /api/userTiers", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/userTiers`);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return User tiers", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/userTiers`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(1);
    });
  });

  describe("GET /api/userTiers/:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const userTierId = faker.string.uuid();

      const response = await supertest(app).get(`/api/userTiers/${userTierId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return User tier detail", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const userTiers = await userTierRepository.get();
      const userTierId = userTiers[0].id;

      const response = await supertest(app)
        .get(`/api/userTiers/${userTierId}`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
