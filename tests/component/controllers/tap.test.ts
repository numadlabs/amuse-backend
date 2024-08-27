import supertest from "supertest";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import { userCardServices } from "../../../src/services/userCardServices";
import { tapServices } from "../../../src/services/tapServices";
import { tapRepository } from "../../../src/repository/tapRepository";

describe("Tap APIs", () => {
  describe("POST /api/taps/generate", () => {
    it("should successfully generate a tap", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post(`/api/taps/generate`)
        .set("Authorization", `Bearer ${user.result.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("encryptedData");
    });
  });

  describe("POST /api/taps/redeem", () => {
    it("should successfully redeem a tap", async () => {
      const restaurant = await testHelpers.createRestaurantWithCard();
      const user = await testHelpers.createUserWithMockedOtp();
      const userCard = await userCardServices.buy(
        user.userId,
        restaurant.card.id
      );
      const encryptedData = await tapServices.generate(user.userId);

      const response = await supertest(app)
        .post(`/api/taps/redeem`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          encryptedData: encryptedData,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("increment");
    });
  });
});
