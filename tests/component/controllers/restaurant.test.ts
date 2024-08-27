import supertest from "supertest";
import { employeeServices } from "../../../src/services/employeeServices";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import { Restaurant } from "../../../src/types/db/types";
import path from "path";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import { faker } from "@faker-js/faker";
import { employeeRepository } from "../../../src/repository/employeeRepository";
import { encryptionHelper } from "../../../src/lib/encryptionHelper";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";

jest.mock("../../../src/lib/emailHelper");
jest.mock("../../../src/utils/aws");

const ownerPayload = {
  email: "owner@sansho.com",
  password: "Password12",
};

const waiterPayload = {
  email: "waiter@sansho.com",
  password: "Password12",
};

describe("Restaurant APIs", () => {
  describe("GET /api/restaurants", () => {
    let userId: string,
      userAccessToken: string,
      waiterAccessToken: string,
      ownerAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      ownerAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(
        "/api/restaurants?time=03:11:09&dayNoOfTheWeek=7"
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(ROLE)", async () => {
      const response = await supertest(app)
        .get("/api/restaurants?time=03:11:09&dayNoOfTheWeek=7")
        .set("Authorization", `Bearer ${ownerAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully return list of restaurants", async () => {
      const response = await supertest(app)
        .get("/api/restaurants?time=03:11:09&dayNoOfTheWeek=7")
        .set("Authorization", `Bearer ${userAccessToken}`);

      const restaurants: Restaurant[] = response.body.data.restaurants;

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(restaurants.length).toBeGreaterThan(0);
    });
  });
  describe("POST /api/restaurants", () => {
    let userId: string,
      userAccessToken: string,
      anotherRestaurantOwnerAccessToken: string,
      ownerAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      anotherRestaurantOwnerAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;

      const owner = await employeeRepository.create({
        email: faker.internet.email().toLowerCase(),
        password: await encryptionHelper.encrypt("Password12"),
        firstname: "restaurant",
        lastname: "owner",
        role: "RESTAURANT_OWNER",
      });

      ownerAccessToken = (
        await employeeServices.login(owner.email.toLowerCase(), "Password12")
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).post("/api/restaurants");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const response = await supertest(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully create restaurant", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/logo.jpg");

      const response = await supertest(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .field("name", "Choijin Temple")
        .field(
          "description",
          "Journey to Mongolia with every bite. Explore the flavors of the steppes and indulge in authentic Mongolian cuisine. From sizzling grilled meats to aromatic stews, experience the richness of nomadic heritage on your plate."
        )
        .field(
          "location",
          "The World Islands - Mongolia - Dubai - United Arabic Emirates"
        )
        .field(
          "googleMapsUrl",
          "https://www.google.com/maps/place/Wrestling+Palace/@47.9123329,106.9360381,14z/data=!4m6!3m5!1s0x5d96923c7bfe80ef:0xbde4c9c449a2c00d!8m2!3d47.917826!4d106.9353974!16s%2Fm%2F05b1rwd?entry=ttu"
        )
        .field("categoryId", "776f61b9-b2cc-48d6-a03b-53574b85bb4c")
        .attach("logo", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
    });
  });
  describe("PUT /api/restaurants/:id/rewardDetail", () => {
    let userId: string,
      userAccessToken: string,
      anotherRestaurantOwnerAccessToken: string,
      ownerAccessToken: string,
      restaurantId: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      anotherRestaurantOwnerAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;

      const restaurant = await restaurantRepository.create({
        name: "Choijin Temple",
        description:
          "Journey to Mongolia with every bite. Explore the flavors of the steppes and indulge in authentic Mongolian cuisine. From sizzling grilled meats to aromatic stews, experience the richness of nomadic heritage on your plate.",
        location:
          "The World Islands - Mongolia - Dubai - United Arabic Emirates",
        latitude: 1,
        longitude: 1,
        googleMapsUrl:
          "https://www.google.com/maps/place/Wrestling+Palace/@47.9123329,106.9360381,14z/data=!4m6!3m5!1s0x5d96923c7bfe80ef:0xbde4c9c449a2c00d!8m2!3d47.917826!4d106.9353974!16s%2Fm%2F05b1rwd?entry=ttu",
        categoryId: "776f61b9-b2cc-48d6-a03b-53574b85bb4c",
      });
      restaurantId = restaurant.id;

      const owner = await employeeRepository.create({
        email: faker.internet.email().toLowerCase(),
        password: await encryptionHelper.encrypt("Password12"),
        firstname: "restaurant",
        lastname: "owner",
        role: "RESTAURANT_OWNER",
        restaurantId: restaurantId,
      });

      ownerAccessToken = (
        await employeeServices.login(owner.email.toLowerCase(), "Password12")
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(ROLE)", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .set("Authorization", `Bearer ${anotherRestaurantOwnerAccessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid perkOccurence value", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .send({
          perkOccurence: 0.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid rewardAmount value", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .send({
          rewardAmount: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update restaurant reward detail", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.perkOccurence).toBe(5);
    });
  });
  describe("GET /api/:id", () => {
    let userId: string,
      userAccessToken: string,
      anotherRestaurantOwnerAccessToken: string,
      ownerAccessToken: string,
      restaurantId: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      const owner = await employeeServices.login(
        ownerPayload.email,
        ownerPayload.password
      );
      if (typeof owner.employee.restaurantId === "string")
        restaurantId = owner.employee.restaurantId;
      ownerAccessToken = owner.accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(
        `/api/restaurants/${restaurantId}?dayNoOfTheWeek=5&time=10:00:00`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully return restaurant", async () => {
      const response = await supertest(app)
        .get(`/api/restaurants/${restaurantId}?dayNoOfTheWeek=5&time=10:00:00`)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.id).toBe(restaurantId);
    });
  });
  describe("PUT /api/:id", () => {
    let userId,
      userAccessToken: string,
      anotherRestaurantOwnerAccessToken: string,
      ownerAccessToken: string,
      restaurantId: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      anotherRestaurantOwnerAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;

      const restaurant = await restaurantRepository.create({
        name: "Choijin Temple",
        description:
          "Journey to Mongolia with every bite. Explore the flavors of the steppes and indulge in authentic Mongolian cuisine. From sizzling grilled meats to aromatic stews, experience the richness of nomadic heritage on your plate.",
        location:
          "The World Islands - Mongolia - Dubai - United Arabic Emirates",
        latitude: 1,
        longitude: 1,
        googleMapsUrl:
          "https://www.google.com/maps/place/Wrestling+Palace/@47.9123329,106.9360381,14z/data=!4m6!3m5!1s0x5d96923c7bfe80ef:0xbde4c9c449a2c00d!8m2!3d47.917826!4d106.9353974!16s%2Fm%2F05b1rwd?entry=ttu",
        categoryId: "776f61b9-b2cc-48d6-a03b-53574b85bb4c",
        logo: "logo",
      });
      restaurantId = restaurant.id;

      const owner = await employeeRepository.create({
        email: faker.internet.email().toLowerCase(),
        password: await encryptionHelper.encrypt("Password12"),
        firstname: "restaurant",
        lastname: "owner",
        role: "RESTAURANT_OWNER",
        restaurantId: restaurantId,
      });

      ownerAccessToken = (
        await employeeServices.login(owner.email.toLowerCase(), "Password12")
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(ROLE)", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${anotherRestaurantOwnerAccessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should successfully update the restaurant(WITHOUT FILE)", async () => {
      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe("Test Restaurant");
    });
    it("should successfully update the restaurant(WITH FILE)", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/logo.jpg");

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${ownerAccessToken}`)
        .field("name", "Test Restaurant")
        .attach("logo", filePath);

      console.error(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe("Test Restaurant");
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });
});
