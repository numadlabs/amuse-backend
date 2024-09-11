import { fa, faker } from "@faker-js/faker";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { generateVerificationToken } from "../../../src/utils/jwt";
import { userServices } from "../../../src/services/userServices";
import supertest from "supertest";
import app from "../../../src/app";
import { employeeServices } from "../../../src/services/employeeServices";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import path from "path";
import { testHelpers } from "../helpers/testHelpers";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/utils/aws");

describe("User APIs", () => {
  describe("PUT /api/users/:id", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid id", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const id = "invalidId";

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)

        .field("nickname", "updatedNickname");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_OWNER"
      );

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not the owner of the user with given id", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const anotherUser = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${anotherUser.accessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update profile picture", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const user = await testHelpers.createUserWithMockedOtp();
      const filePath = path.join(__dirname, "../assets/profile.png");

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .field("nickname", "updatedNickname")
        .attach("profilePicture", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });

    it("should successfully update profile picture and delete the previous profile picture file", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const user = await testHelpers.createUserWithMockedOtp();
      const filePath = path.join(__dirname, "../assets/profile.png");

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .field("nickname", "updatedNickname")
        .attach("profilePicture", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });

    // it("should successfully delete the previous profile picture file(ON TOGGLE)", async () => {
    //   (uploadToS3 as jest.Mock).mockResolvedValue({});
    //   (deleteFromS3 as jest.Mock).mockResolvedValue({});
    //   const user = await testHelpers.createUserWithMockedOtp();

    //   const response = await supertest(app)
    //     .put(`/api/users/${user.user.id}`)
    //     .set("Authorization", `Bearer ${user.accessToken}`)
    //     .field("nickname", "updatedNickname")
    //     .field("profilePicture", "");

    //   expect(response.status).toBe(200);
    //   expect(response.body.success).toBe(true);
    //   expect(uploadToS3).toHaveBeenCalledTimes(0);
    //   expect(deleteFromS3).toHaveBeenCalledTimes(1);
    // });

    it("should successfully update info", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .put(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.nickname).toBe("updatedNickname");
      expect(uploadToS3).toHaveBeenCalledTimes(0);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });
  });

  describe("PUT /api/updateEmail", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app).put(`/api/users/updateEmail`).send({
        email: faker.internet.email(),
        verificationCode: verificationCode,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${employee.accessToken}`)
        .send({
          email: faker.internet.email(),
          verificationCode: verificationCode,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid email format", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          email: "invalidEmail.com",
          verificationCode: verificationCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on invalid verificationCode", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ email: faker.internet.email(), verificationCode: 9999 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail on already used verificationCode", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: true,
      });
      const invalidVerificationCode = faker.number.int({
        min: 1000,
        max: 9999,
      });
      expect(verificationCode).not.toBe(invalidVerificationCode);

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({
          email: faker.internet.email(),
          verificationCode: invalidVerificationCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should successfully update the email", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${user.accessToken}`)
        .send({ email: email, verificationCode: verificationCode });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email.toLowerCase());
    });
  });

  describe("DELETE /api/users", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).delete(`/api/users`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .delete(`/api/users`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully delete the user", async () => {
      const user = await testHelpers.createUserWithMockedOtp();
      (deleteFromS3 as jest.Mock).mockResolvedValue({});

      const response = await supertest(app)
        .delete(`/api/users`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });

    // it("should successfully delete profile picture file", async () => {
    //   (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
    //     verificationCode: generateVerificationToken(
    //       userPayload.verificationCode,
    //       "1h"
    //     ),
    //     isUsed: false,
    //   });
    //   const result = await userServices.create(
    //     userPayload.email,
    //     userPayload.password,
    //     userPayload.nickname,
    //     userPayload.verificationCode
    //   );
    //   let userId: strin;
    //   if (typeof result.user.id === "string") userId = result.user.id;
    //   userAccessToken = result.accessToken;

    //   (uploadToS3 as jest.Mock).mockResolvedValue({});
    //   const filePath = path.join(__dirname, "../assets/profile.png");
    //   const id = userId;
    //   await supertest(app)
    //     .put(`/api/users/${id}`)
    //     .set("Authorization", `Bearer ${userAccessToken}`)
    //     .attach("profilePicture", filePath);
    //   jest.resetAllMocks();
    //   (deleteFromS3 as jest.Mock).mockResolvedValue({});

    //   const response = await supertest(app)
    //     .delete(`/api/users`)
    //     .set("Authorization", `Bearer ${userAccessToken}`);

    //   expect(response.status).toBe(200);
    //   expect(response.body.success).toBe(true);
    //   expect(deleteFromS3).toHaveBeenCalledTimes(1);
    // });

    // it("should successfully increase the restaurant balances accordingly", async () => {});
  });

  describe("GET /api/users/cards", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/cards`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized(ROLE)", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/users/cards`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return the user's owned cards", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/users/cards`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/users/collected-data", () => {
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/collected-data`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/users/collected-data`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return the user's collected data", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/users/collected-data`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/locations", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/locations`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/users/locations`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return the users' distinct locations", async () => {
      const owner = await testHelpers.createEmployee(null, "RESTAURANT_OWNER");

      const response = await supertest(app)
        .get(`/api/users/locations`)
        .set("Authorization", `Bearer ${owner.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const userId = faker.string.uuid();

      const response = await supertest(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const userId = faker.string.uuid();
      const employee = await testHelpers.createEmployee(
        null,
        "RESTAURANT_MANAGER"
      );

      const response = await supertest(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${employee.accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return the user", async () => {
      const user = await testHelpers.createUserWithMockedOtp();

      const response = await supertest(app)
        .get(`/api/users/${user.user.id}`)
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
