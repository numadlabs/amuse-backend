import supertest from "supertest";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { restaurantServices } from "../../../src/services/restaurantServices";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";

describe("UserCard APIs", () => {
  describe("POST /api/userCards/:cardId/buy", () => {
    it("should successfully buy a card", async () => {
      const restaurant = await restaurantRepository.get();
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post(`/api/userCards/${restaurant[0].cardId}/buy`)
        .set("Authorization", `Bearer ${user.result.accessToken}`)
        .send({
          cardId: restaurant[0].cardId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
