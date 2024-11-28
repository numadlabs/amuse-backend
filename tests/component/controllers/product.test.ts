import supertest from "supertest";
import { testHelpers } from "../helpers/testHelpers";
import app from "../../../src/app";
import path from "path";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import { faker } from "@faker-js/faker";

jest.mock("../../../src/utils/aws");

describe("Product APIs", () => {
  describe("POST /api/product", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).post("/api/product");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const waiter = await testHelpers.createEmployee({}, "RESTAURANT_WAITER");

      const response = await supertest(app)
        .post("/api/product")
        .set("Authorization", `Bearer ${waiter.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is from different restaurant", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const anotherRestaurant = await testHelpers.createRestaurantWithOwner();
      const productCategory = await testHelpers.createCategory();
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/product.jpg");

      const response = await supertest(app)
        .post("/api/product")
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", faker.commerce.productName())
        .field("description", faker.commerce.productDescription())
        .field("price", faker.number.int({ min: 1, max: 1000 }))
        .field("productCategoryId", productCategory.id)
        .field("restaurantId", anotherRestaurant.data.id)
        .attach("image", filePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully create product", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const productCategory = await testHelpers.createCategory();
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/product.jpg");

      const response = await supertest(app)
        .post("/api/product")
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", faker.commerce.productName())
        .field("description", faker.commerce.productDescription())
        .field("price", faker.number.int({ min: 1, max: 1000 }))
        .field("productCategoryId", productCategory.id)
        .field("restaurantId", restaurant.data.id)
        .attach("image", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("PUT /api/product/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const productId = faker.string.uuid();

      const response = await supertest(app)
        .put(`/api/product/${productId}`)
        .field("name", "Test Product");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        { restaurantId: restaurant.data.id },
        "RESTAURANT_WAITER"
      );
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });

      const response = await supertest(app)
        .put(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${waiter.accessToken}`)
        .field("name", "Test Product");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is from different restaurant", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const anotherRestaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });

      const response = await supertest(app)
        .put(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${anotherRestaurant.ownerAccessToken}`)
        .field("name", "Test Product");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update product without image", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });
      const newName = "Updated Product Name";

      const response = await supertest(app)
        .put(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", newName);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(newName);
    });

    it("should successfully update product with image", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const filePath = path.join(__dirname, "../assets/product.jpg");

      const response = await supertest(app)
        .put(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`)
        .field("name", "Updated Product")
        .attach("image", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("DELETE /api/product/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const productId = faker.string.uuid();

      const response = await supertest(app).delete(`/api/product/${productId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const waiter = await testHelpers.createEmployee(
        { restaurantId: restaurant.data.id },
        "RESTAURANT_WAITER"
      );
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });

      const response = await supertest(app)
        .delete(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${waiter.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is from different restaurant", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const anotherRestaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });

      const response = await supertest(app)
        .delete(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${anotherRestaurant.ownerAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully delete product", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });
      (deleteFromS3 as jest.Mock).mockResolvedValue({});

      const response = await supertest(app)
        .delete(`/api/product/${product.id}`)
        .set("Authorization", `Bearer ${restaurant.ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/product/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should successfully get product by id", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      const { product } = await testHelpers.createProduct({
        restaurantId: restaurant.data.id,
      });

      const response = await supertest(app).get(`/api/product/${product.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.id).toBe(product.id);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = faker.string.uuid();

      const response = await supertest(app).get(
        `/api/product/${nonExistentId}`
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/product", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should successfully get filtered products", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      await testHelpers.createProduct({ restaurantId: restaurant.data.id });
      await testHelpers.createProduct({ restaurantId: restaurant.data.id });

      const response = await supertest(app)
        .get("/api/product")
        .query({ restaurantId: restaurant.data.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBe(2);
    });

    it("should return empty array when no products match filter", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();

      const response = await supertest(app)
        .get("/api/product")
        .query({ restaurantId: restaurant.data.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });
  });

  describe("GET /api/product/restaurant/:restaurantId", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should successfully get products by restaurant id", async () => {
      const restaurant = await testHelpers.createRestaurantWithOwner();
      await testHelpers.createProduct({ restaurantId: restaurant.data.id });
      await testHelpers.createProduct({ restaurantId: restaurant.data.id });

      const response = await supertest(app).get(
        `/api/product/restaurant/${restaurant.data.id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBe(2);
    });

    it("should return empty array for non-existent restaurant", async () => {
      const nonExistentId = faker.string.uuid();

      const response = await supertest(app).get(
        `/api/product/restaurant/${nonExistentId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });
  });
});
