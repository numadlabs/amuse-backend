import request from "supertest";

import app from "../../src/app";
import { db } from "../../src/utils/db";

afterAll(async () => {
  await db.destroy();
});

describe("Login", () => {
  describe("When invalid telNumber, password", () => {
    it("should return status 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ prefix: "976", telNumber: "99090280", password: "12" });

      expect(res.statusCode).toBe(500);
    });
  });
  describe("When valid login info", () => {
    it("should return status 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ prefix: "976", telNumber: "99090280", password: "123" });

      expect(res.statusCode).toBe(200);
    });
  });
});
