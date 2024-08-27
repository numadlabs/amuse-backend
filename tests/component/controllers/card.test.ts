import supertest from "supertest";
import { employeeServices } from "../../../src/services/employeeServices";
import app from "../../../src/app";
import path from "path";
import { faker } from "@faker-js/faker";
import { testHelpers } from "../helpers/testHelpers";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import { cardRepository } from "../../../src/repository/cardRepository";

jest.mock("../../../src/utils/aws");

const existingRestaurantOwner = {
  email: "owner@fatcat.com",
  password: "Password12",
};

const existingRestaurantWaiter = {
  email: "waiter@fatcat.com",
  password: "Password12",
};

describe("Card APIs", () => {
  describe("POST /api/cards", () => {
    let existingRestaurantOwnerAccessToken: string,
      existingRestaurantWaiterAccessToken: string,
      existingRestaurantId: string;

    let restaurantId: string, ownerAccessToken: string;
    beforeAll(async () => {
      const owner = await employeeServices.login(
        existingRestaurantOwner.email,
        existingRestaurantOwner.password
      );
      existingRestaurantOwnerAccessToken = owner.accessToken;
      if (owner.employee.restaurantId)
        existingRestaurantId = owner.employee.restaurantId;

      const waiter = await employeeServices.login(
        existingRestaurantWaiter.email,
        existingRestaurantWaiter.password
      );
      existingRestaurantWaiterAccessToken = waiter.accessToken;
      if (waiter.employee.restaurantId)
        existingRestaurantId = waiter.employee.restaurantId;

      const result = await testHelpers.createRestaurant();
      restaurantId = result.restaurantId;
      ownerAccessToken = result.ownerAccessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", existingRestaurantId)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(ROLE)", async () => {
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${existingRestaurantWaiterAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", existingRestaurantId)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurantId)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should fail if restaurant has existing card", async () => {
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", existingRestaurantId)
        .field(
          "nftUrl",
          "https://opensea.io/assets/ethereum/0xbe9371326f91345777b04394448c23e2bfeaa826/66118"
        )
        .attach("nftImage", filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should successfully create the card", async () => {
      const filePath = path.join(__dirname, "../assets/NFT.png");
      (uploadToS3 as jest.Mock).mockResolvedValue({});

      const response = await supertest(app)
        .post("/api/cards")
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit")
        .field(
          "instruction",
          "Show your Amuse Bouche QR code to check in and unlock rewards with each visit."
        )
        .field("restaurantId", restaurantId)
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
    let existingRestaurantOwnerAccessToken: string,
      existingRestaurantWaiterAccessToken: string,
      existingRestaurantId: string,
      existingCardId: string;

    let anotherRestaurantId: string, anotherRestaurantOwnerAccessToken: string;

    beforeAll(async () => {
      const owner = await employeeServices.login(
        existingRestaurantOwner.email,
        existingRestaurantOwner.password
      );
      existingRestaurantOwnerAccessToken = owner.accessToken;
      if (owner.employee.restaurantId)
        existingRestaurantId = owner.employee.restaurantId;

      const waiter = await employeeServices.login(
        existingRestaurantWaiter.email,
        existingRestaurantWaiter.password
      );
      existingRestaurantWaiterAccessToken = waiter.accessToken;
      if (waiter.employee.restaurantId)
        existingRestaurantId = waiter.employee.restaurantId;
      const card = await cardRepository.getByRestaurantId(existingRestaurantId);
      existingCardId = card[0].id;

      const result = await testHelpers.createRestaurant();
      anotherRestaurantId = result.restaurantId;
      anotherRestaurantOwnerAccessToken = result.ownerAccessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .put(`/api/cards/${existingCardId}`)
        .field("benefits", "Earn Bitcoin for every visit.");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(ROLE)", async () => {
      const response = await supertest(app)
        .put(`/api/cards/${existingCardId}`)
        .set("Authorization", `Bearer ${existingRestaurantWaiterAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const response = await supertest(app)
        .put(`/api/cards/${existingCardId}`)
        .set("Authorization", `Bearer ${anotherRestaurantOwnerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update the card(WITHOUT FILE)", async () => {
      const response = await supertest(app)
        .put(`/api/cards/${existingCardId}`)
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should successfully update the card(WITH FILE)", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/NFT.png");

      const response = await supertest(app)
        .put(`/api/cards/${existingCardId}`)
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`)
        .field("benefits", "Earn Bitcoin for every visit.")
        .attach("nftImage", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/cards/:id", () => {
    let existingRestaurantOwnerAccessToken: string,
      existingRestaurantWaiterAccessToken: string,
      existingRestaurantId: string,
      existingCardId: string;

    beforeAll(async () => {
      const owner = await employeeServices.login(
        existingRestaurantOwner.email,
        existingRestaurantOwner.password
      );
      existingRestaurantOwnerAccessToken = owner.accessToken;
      if (owner.employee.restaurantId)
        existingRestaurantId = owner.employee.restaurantId;

      const waiter = await employeeServices.login(
        existingRestaurantWaiter.email,
        existingRestaurantWaiter.password
      );
      existingRestaurantWaiterAccessToken = waiter.accessToken;
      if (waiter.employee.restaurantId)
        existingRestaurantId = waiter.employee.restaurantId;
      const card = await cardRepository.getByRestaurantId(existingRestaurantId);
      existingCardId = card[0].id;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/cards/${existingCardId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully get the card", async () => {
      const response = await supertest(app)
        .get(`/api/cards/${existingCardId}`)
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/cards/:restaurantId/restaurants", () => {
    let existingRestaurantOwnerAccessToken: string,
      existingRestaurantWaiterAccessToken: string,
      existingRestaurantId: string,
      existingCardId: string;

    beforeAll(async () => {
      const owner = await employeeServices.login(
        existingRestaurantOwner.email,
        existingRestaurantOwner.password
      );
      existingRestaurantOwnerAccessToken = owner.accessToken;
      if (owner.employee.restaurantId)
        existingRestaurantId = owner.employee.restaurantId;

      const waiter = await employeeServices.login(
        existingRestaurantWaiter.email,
        existingRestaurantWaiter.password
      );
      existingRestaurantWaiterAccessToken = waiter.accessToken;
      if (waiter.employee.restaurantId)
        existingRestaurantId = waiter.employee.restaurantId;
      const card = await cardRepository.getByRestaurantId(existingRestaurantId);
      existingCardId = card[0].id;
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(
        `/api/cards/${existingRestaurantId}/restaurants`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully get the card", async () => {
      const response = await supertest(app)
        .get(`/api/cards/${existingRestaurantId}/restaurants`)
        .set("Authorization", `Bearer ${existingRestaurantOwnerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
