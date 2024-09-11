import supertest from "supertest";
import app from "../../../src/app";
import { testHelpers } from "../helpers/testHelpers";

jest.mock("../../../src/repository/emailOtpRepository");

describe("Country APIs", () => {
  describe("GET /api/countries", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get("/api/countries");

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return list of countries", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get("/api/countries")
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.countries.length).toBeGreaterThan(100);
    });
  });
});
