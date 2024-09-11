import supertest from "supertest";
import { employeeServices } from "../../../src/services/employeeServices";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import { Restaurant } from "../../../src/types/db/types";
import path from "path";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import { fa, faker } from "@faker-js/faker";
import { employeeRepository } from "../../../src/repository/employeeRepository";
import { encryptionHelper } from "../../../src/lib/encryptionHelper";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { db } from "../../../src/utils/db";

jest.mock("../../../src/lib/emailHelper");
jest.mock("../../../src/utils/aws");

describe("Restaurant APIs", () => {
  describe("GET /api/restaurants", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(
        "/api/restaurants?time=03:11:09&dayNoOfTheWeek=7"
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get("/api/restaurants?time=03:11:09&dayNoOfTheWeek=7")
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return list of restaurants", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get("/api/restaurants?time=03:11:09&dayNoOfTheWeek=7")
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/restaurants", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).post("/api/restaurants");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const waiter = await testHelpers.createEmployee(
        null,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${waiter.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully create restaurant", async () => {
      const owner = await testHelpers.createEmployee(null, "RESTAURANT_OWNER");
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/logo.jpg");
      const category = await testHelpers.createCategory();

      const response = await supertest(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${owner.accessToken}`)
        .field("name", faker.company.name())
        .field("description", faker.company.catchPhrase())
        .field("location", faker.location.streetAddress())
        .field(
          "googleMapsUrl",
          "https://www.google.com/maps/place/FAT+CAT/@50.0811728,14.4258677,17z/data=!3m1!4b1!4m6!3m5!1s0x470b955b7e812c07:0x5d15b4ab301988cb!8m2!3d50.0811728!4d14.4284426!16s%2Fg%2F11rsh51hd8?entry=ttu&g_ep=EgoyMDI0MDkwNC4wIKXMDSoASAFQAw%3D%3D"
        )
        .field("categoryId", category.id)
        .attach("logo", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("PUT /api/restaurants/:id/rewardDetail", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurantId = faker.string.uuid();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}/rewardDetail`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}/rewardDetail`)
        .set("Authorization", `Bearer ${waiter.accessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const anotherRestaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}/rewardDetail`)
        .set("Authorization", `Bearer ${anotherRestaurant.ownerAccessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid perkOccurence value", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}/rewardDetail`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          perkOccurence: 0.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid rewardAmount value", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}/rewardDetail`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          rewardAmount: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update restaurant reward detail", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}/rewardDetail`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .send({
          perkOccurence: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.perkOccurence).toBe(5);
    });
  });

  describe("GET /api/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurantId = faker.string.uuid();

      const response = await supertest(app).get(
        `/api/restaurants/${restaurantId}?dayNoOfTheWeek=5&time=10:00:00`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return restaurant", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwnerAndCard();

      const response = await supertest(app)
        .get(
          `/api/restaurants/${restaurant.data.id}?dayNoOfTheWeek=5&time=10:00:00`
        )
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.id).toBe(restaurant.data.id);
    });
  });

  describe("PUT /api/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const restaurantId = faker.string.uuid();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurantId}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        restaurant.data.id,
        "RESTAURANT_WAITER"
      );

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}`)
        .set("Authorization", `Bearer ${waiter.accessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(RESTAURANTID)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const anotherRestaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}`)
        .set("Authorization", `Bearer ${anotherRestaurant.ownerAccessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update the restaurant(WITHOUT FILE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", "Test Restaurant");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe("Test Restaurant");
    });

    it("should successfully update the restaurant(WITH FILE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/logo.jpg");

      const response = await supertest(app)
        .put(`/api/restaurants/${restaurant.data.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", "Test Restaurant")
        .attach("logo", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe("Test Restaurant");
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });
});
