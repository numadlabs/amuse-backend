import supertest from "supertest";
import app from "../../../src/app";
import path from "path";
import { faker } from "@faker-js/faker";
import { testHelpers } from "../helpers/testHelpers";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import { cardRepository } from "../../../src/repository/cardRepository";

jest.mock("../../../src/utils/aws");

describe("Card APIs", () => {
  describe("POST /api/cards", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurant.data.id)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const manager = await testHelpers.createEmployee(
        { restaurantId: restaurant.data.id },
        "RESTAURANT_MANAGER"
      );
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${manager.accessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurant.data.id)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const differentRestaurant = await testHelpers.createRestaurantWithOwner();
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurant.data.id)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail if restaurant has existing card", async () => {
      const restaurantWithCard =
        await testHelpers.createRestaurantWithOwnerAndCard();
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${restaurantWithCard.ownerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurantWithCard.data.id)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully create the card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const filePath = path.join(__dirname, "../assets/NFT.png");
      (uploadToS3 as jest.Mock).mockResolvedValue({});

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurant.data.id)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("PUT /api/cards/:id", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .put(`/api/cards/${restaurant.card.id}`)
        .field("benefits", faker.company.buzzPhrase());

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      const waiter = await testHelpers.createEmployee(
        { restaurantId: restaurant.data.id },
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .put(`/api/cards/${restaurant.card.id}`)
        .set("Authorization", `Bearer ${waiter.accessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      const differentRestaurant =
        await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .put(`/api/cards/${restaurant.card.id}`)
        .set("Authorization", `Bearer ${differentRestaurant.ownerAccessToken}`)
        .field("benefits", faker.company.buzzPhrase());

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update the card(WITHOUT FILE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .put(`/api/cards/${restaurant.card.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("benefits", faker.company.buzzPhrase());

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should successfully update the card(WITH FILE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .put(`/api/cards/${restaurant.card.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.")
        .attach("nftImage", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/cards/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app).get(
        `/api/cards/${restaurant.card.id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully get the card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .get(`/api/cards/${restaurant.card.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/cards/:restaurantId/restaurants", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app).get(
        `/api/cards/${restaurant.card.id}/restaurants`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully get the card", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .get(`/api/cards/${restaurant.card.id}/restaurants`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
