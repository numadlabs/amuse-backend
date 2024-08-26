import { fa, faker } from "@faker-js/faker";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { generateVerificationToken } from "../../../src/utils/jwt";
import { userServices } from "../../../src/services/userServices";
import supertest from "supertest";
import app from "../../../src/app";
import { employeeServices } from "../../../src/services/employeeServices";
import { deleteFromS3, uploadToS3 } from "../../../src/utils/aws";
import path from "path";
import { testHelpers } from "../helpers.ts/testHelpers";

jest.mock("../../../src/repository/emailOtpRepository");
jest.mock("../../../src/utils/aws");

const ownerPayload = {
  email: "owner@sasazu.com",
  password: "Password12",
};

const waiterPayload = {
  email: "waiter@sasazu.com",
  password: "Password12",
};

describe("User APIs", () => {
  describe("PUT /api/users/:id", () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      nickname: faker.internet.userName(),
      verificationCode: faker.number.int({ min: 1000, max: 9999 }),
    };
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });
      const result = await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );

      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;
      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail on invalid id", async () => {
      const id = "invalidId";

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)

        .field("nickname", "updatedNickname");
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authenticated", async () => {
      const id = userId;

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const id = userId;

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${employeeAccessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not the owner of the user with given id", async () => {
      const id = faker.string.uuid();

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully upload profile picture file", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const id = userId;
      const filePath = path.join(__dirname, "../assets/profile.png");

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("nickname", "updatedNickname")
        .attach("profilePicture", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });

    it("should successfully upload profile picture file and delete the previous profile picture file", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const id = userId;
      const filePath = path.join(__dirname, "../assets/profile.png");

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("nickname", "updatedNickname")
        .attach("profilePicture", filePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(1);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });

    it("should successfully delete the previous profile picture file(ON TOGGLE)", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const id = userId;

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("nickname", "updatedNickname")
        .field("profilePicture", "");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(uploadToS3).toHaveBeenCalledTimes(0);
      expect(deleteFromS3).toHaveBeenCalledTimes(1);
    });

    it("should successfully update info", async () => {
      (uploadToS3 as jest.Mock).mockResolvedValue({});
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const id = userId;

      const response = await supertest(app)
        .put(`/api/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .field("nickname", "updatedNickname");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.nickname).toBe("updatedNickname");
      expect(uploadToS3).toHaveBeenCalledTimes(0);
      expect(deleteFromS3).toHaveBeenCalledTimes(0);
    });
  });
  describe("PUT /api/updateEmail", () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      nickname: faker.internet.userName(),
      verificationCode: faker.number.int({ min: 1000, max: 9999 }),
    };
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });
      const result = await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;
      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .send({ email, verificationCode: verificationCode });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized", async () => {
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${employeeAccessToken}`)
        .send({ email, verificationCode: verificationCode });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail on invalid email", async () => {
      const invalidEmail = "invalidEmail.com";
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({ email: invalidEmail, verificationCode: verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should fail on invalid verificationCode", async () => {
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({ email: email, verificationCode: 9999 }); //possibly invalid verificationCode, will improve later

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should fail on already used verificationCode", async () => {
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: true,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({ email: email, verificationCode: verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    it("should successfully update the email", async () => {
      const email = faker.internet.email();
      const verificationCode = faker.number.int({ min: 1000, max: 9999 });
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(verificationCode, "1h"),
        isUsed: false,
      });

      const response = await supertest(app)
        .put(`/api/users/updateEmail`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send({ email: email, verificationCode: verificationCode });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email.toLowerCase());
    });
  });
  describe("DELETE /api/users", () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      nickname: faker.internet.userName(),
      verificationCode: faker.number.int({ min: 1000, max: 9999 }),
    };
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
        verificationCode: generateVerificationToken(
          userPayload.verificationCode,
          "1h"
        ),
        isUsed: false,
      });
      const result = await userServices.create(
        userPayload.email,
        userPayload.password,
        userPayload.nickname,
        userPayload.verificationCode
      );
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;
      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).delete(`/api/users`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized", async () => {
      const response = await supertest(app)
        .delete(`/api/users`)
        .set("Authorization", `Bearer ${employeeAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully delete the user", async () => {
      (deleteFromS3 as jest.Mock).mockResolvedValue({});
      const response = await supertest(app)
        .delete(`/api/users`)
        .set("Authorization", `Bearer ${userAccessToken}`);

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
    //   let userId: strin
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

    //   console.error(response.body);

    //   expect(response.status).toBe(200);
    //   expect(response.body.success).toBe(true);
    //   expect(deleteFromS3).toHaveBeenCalledTimes(1);
    // });
    // it("should successfully increase the restaurant balances accordingly", async () => {});
  });
  describe("GET /api/users/cards", () => {
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });
    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/cards`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should fail if requester is not authorized", async () => {
      const response = await supertest(app)
        .get(`/api/users/cards`)
        .set("Authorization", `Bearer ${employeeAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully return the user's owned cards", async () => {
      const response = await supertest(app)
        .get(`/api/users/cards`)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("GET /api/users/collected-data", () => {
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/collected-data`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const response = await supertest(app)
        .get(`/api/users/collected-data`)
        .set("Authorization", `Bearer ${employeeAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should successfully return the user's collected data", async () => {
      const response = await supertest(app)
        .get(`/api/users/collected-data`)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("GET /api/locations", () => {
    let userId: string,
      userAccessToken: string,
      ownerAccessToken: string,
      waiterAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      ownerAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;

      waiterAccessToken = (
        await employeeServices.login(
          waiterPayload.email,
          waiterPayload.password
        )
      ).accessToken;
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/locations`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const response = await supertest(app)
        .get(`/api/users/locations`)
        .set("Authorization", `Bearer ${waiterAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully return the users' distinct locations", async () => {
      const response = await supertest(app)
        .get(`/api/users/locations`)
        .set("Authorization", `Bearer ${ownerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe("GET /api/:id", () => {
    let userId: string, userAccessToken: string, employeeAccessToken: string;
    beforeAll(async () => {
      const result = await testHelpers.createUserWithMockedOtp();
      if (typeof result.user.id === "string") userId = result.user.id;
      userAccessToken = result.accessToken;

      employeeAccessToken = (
        await employeeServices.login(ownerPayload.email, ownerPayload.password)
      ).accessToken;
    });

    it("should fail if requester is not authenticated", async () => {
      const response = await supertest(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail if requester is not authorized", async () => {
      const response = await supertest(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${employeeAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    it("should successfully return the user", async () => {
      const response = await supertest(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
