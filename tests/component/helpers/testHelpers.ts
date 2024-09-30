import { faker } from "@faker-js/faker";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { userServices } from "../../../src/services/userServices";
import {
  generateAccessToken,
  generateVerificationToken,
} from "../../../src/utils/jwt";
import path from "path";
import { restaurantServices } from "../../../src/services/restaurantServices";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { categoryRepository } from "../../../src/repository/categoryRepository";
import { cardRepository } from "../../../src/repository/cardRepository";
import { employeeRepository } from "../../../src/repository/employeeRepository";
import { encryptionHelper } from "../../../src/lib/encryptionHelper";
import { employeeServices } from "../../../src/services/employeeServices";
import { ROLES } from "../../../src/types/db/enums";
import { db } from "../../../src/utils/db";
import { userTierRepository } from "../../../src/repository/userTierRepository";
import generatePassword from "./passwordGenerator";

jest.mock("../../../src/repository/emailOtpRepository");

export const testHelpers = {
  createUserWithMockedOtp: async (
    userPayload: {
      email?: string;
      password?: string;
      nickname?: string;
      verificationCode?: number;
    } = {}
  ) => {
    const defaultPayload = {
      email: faker.internet.email().toLowerCase(),
      password: generatePassword(),
      nickname: faker.internet.userName(),
      verificationCode: faker.number.int({ min: 1000, max: 9999 }),
      ...userPayload, // Overwrite defaults with provided values
    };

    (emailOtpRepository.getByEmail as jest.Mock).mockResolvedValue({
      verificationCode: generateVerificationToken(
        defaultPayload.verificationCode,
        "1h"
      ),
      isUsed: false,
    });

    const result = await userServices.create(
      defaultPayload.email,
      defaultPayload.password,
      defaultPayload.nickname,
      defaultPayload.verificationCode
    );

    let userId: string = "";
    if (typeof result.user.id === "string") userId = result.user.id;

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      password: defaultPayload.password,
      userId: userId,
    };
  },
  createRestaurantWithOwner: async () => {
    const categories = await categoryRepository.create({
      name: faker.commerce.department(),
    });
    const restaurantPayload = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      location: faker.location.streetAddress(),
      googleMapsUrl: faker.internet.url(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      categoryId: categories.id,
      logo: faker.string.uuid(),
    };
    const restaurant = await restaurantRepository.create(restaurantPayload);

    const ownerPassword = generatePassword();
    const owner = await employeeRepository.create(db, {
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(ownerPassword),
      fullname: faker.company.name(),
      role: "RESTAURANT_OWNER",
      restaurantId: restaurant.id,
    });
    const ownerAccessToken = generateAccessToken({
      id: owner.id,
      role: owner.role,
    });

    return { data: restaurant, ownerAccessToken };
  },
  createRestaurantWithOwnerAndCard: async (balance: number = 0) => {
    const categories = await categoryRepository.create({
      name: faker.commerce.department(),
    });
    const restaurantPayload = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      location: faker.location.streetAddress(),
      googleMapsUrl: faker.internet.url(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      categoryId: categories.id,
      logo: faker.string.uuid(),
      balance: balance,
    };
    const restaurant = await restaurantRepository.create(restaurantPayload);

    const ownerPassword = generatePassword();
    const owner = await employeeRepository.create(db, {
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(ownerPassword),
      fullname: faker.company.name(),
      role: "RESTAURANT_OWNER",
      restaurantId: restaurant.id,
    });
    const ownerAccessToken = generateAccessToken({
      id: owner.id,
      role: owner.role,
    });

    const cardPayload = {
      benefits: faker.commerce.productDescription(),
      instruction: faker.commerce.productDescription(),
      restaurantId: restaurant.id,
      nftUrl: faker.internet.url(),
      nftImageUrl: faker.string.uuid(),
    };
    const card = await cardRepository.create(cardPayload);

    return { data: restaurant, ownerAccessToken, card };
  },
  createEmployee: async (restaurantId: string | null, role: ROLES) => {
    const password = generatePassword();

    const employee = await employeeRepository.create(db, {
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(password),
      fullname: faker.company.name(),
      role: role,
      restaurantId: restaurantId,
    });

    const accessToken = generateAccessToken({
      id: employee.id,
      role: employee.role,
    });

    return { employee, password, accessToken };
  },
  createCategory: async () => {
    const category = await categoryRepository.create({
      name: faker.commerce.department(),
    });

    return category;
  },
};
