import supertest from "supertest";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import { userCardServices } from "../../../src/services/userCardServices";
import { tapServices } from "../../../src/services/tapServices";
import { tapRepository } from "../../../src/repository/tapRepository";
import { faker } from "@faker-js/faker";

describe("Tap APIs", () => {
  describe("POST /api/taps/generate", () => {
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).post(`/api/taps/generate`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .post(`/api/taps/generate`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully generate a tap", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post(`/api/taps/generate`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("encryptedData");
    });
  });

  describe("POST /api/taps/redeem", () => {
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).post(`/api/taps/redeem`).send({
        encryptedData: faker.lorem.sentence(),
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .post(`/api/taps/redeem`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          encryptedData: faker.lorem.sentence(),
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester does not own the card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      const user = await testHelpers.createUserWithMockedOtp();
      const encryptedData = await tapServices.generate(user.userId);

      const response = await supertest(app)
        .post(`/api/taps/redeem`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          encryptedData: encryptedData,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully redeem a tap on restaurant with 0 balance", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard(0);
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
    });

    it("should successfully redeem a tap on restaurant with sufficient balance", async () => {
      const createdRestaurant =
        await testHelpers.createRestaurantWithOwnerAndCard(1);
      const user = await testHelpers.createUserWithMockedOtp();
      const userCard = await userCardServices.buy(
        user.userId,
        createdRestaurant.card.id
      );
      const encryptedData = await tapServices.generate(user.userId);

      const response = await supertest(app)
        .post(`/api/taps/redeem`)
        .set("Authorization", `Bearer ${createdRestaurant.ownerAccessToken}`)
        .send({
          encryptedData: encryptedData,
        });

      const restaurant = await restaurantRepository.getById(
        createdRestaurant.data.id
      );
      expect(restaurant.balance < createdRestaurant.data.balance);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
