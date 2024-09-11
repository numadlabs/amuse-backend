import supertest from "supertest";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { restaurantServices } from "../../../src/services/restaurantServices";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import { faker } from "@faker-js/faker";
import { userCardServices } from "../../../src/services/userCardServices";
import { userCardReposity } from "../../../src/repository/userCardRepository";

describe("UserCard APIs", () => {
  describe("POST /api/userCards/:cardId/buy", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const cardId = faker.string.uuid();

      const response = await supertest(app).post(
        `/api/userCards/${cardId}/buy`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );
      const cardId = faker.string.uuid();

      const response = await supertest(app)
        .post(`/api/userCards/${cardId}/buy`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if user already owns the card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      const user = await testHelpers.createUserWithMockedOtp();
      await userCardReposity.create(user.userId, restaurant.card.id);

      const response = await supertest(app)
        .post(`/api/userCards/${restaurant.card.id}/buy`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully buy a card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post(`/api/userCards/${restaurant.card.id}/buy`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
