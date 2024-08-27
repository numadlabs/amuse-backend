import { faker } from "@faker-js/faker";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { userServices } from "../../../src/services/userServices";
import { generateVerificationToken } from "../../../src/utils/jwt";
import path from "path";
import { restaurantServices } from "../../../src/services/restaurantServices";
import { restaurantRepository } from "../../../src/repository/restaurantRepository";
import { categoryRepository } from "../../../src/repository/categoryRepository";
import { cardRepository } from "../../../src/repository/cardRepository";
import { employeeRepository } from "../../../src/repository/employeeRepository";
import { encryptionHelper } from "../../../src/lib/encryptionHelper";
import { employeeServices } from "../../../src/services/employeeServices";
import { ROLES } from "../../../src/types/db/enums";

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
      email: faker.internet.email(),
      password: faker.internet.password(),
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

    jest.resetAllMocks();

    return { result, password: defaultPayload.password, userId: userId };
  },
  createRestaurant: async () => {
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

    const ownerPassword = faker.internet.password();
    const owner = await employeeRepository.create({
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(ownerPassword),
      firstname: faker.company.name(),
      lastname: "owner",
      role: "RESTAURANT_OWNER",
      restaurantId: restaurant.id,
    });
    const ownerAccessToken = (
      await employeeServices.login(owner.email, ownerPassword)
    ).accessToken;

    return { restaurantId: restaurant.id, ownerAccessToken };

    // const cardPayload = {
    //   benefits: faker.commerce.productDescription(),
    //   instruction: faker.commerce.productDescription(),
    //   restaurantId: restaurant.id,
    //   nftUrl: faker.internet.url(),
    //   nftImageUrl: faker.string.uuid(),
    // };
    // const card = await cardRepository.create(cardPayload);
  },
  createRestaurantWithCard: async () => {
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

    const ownerPassword = faker.internet.password();
    const owner = await employeeRepository.create({
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(ownerPassword),
      firstname: faker.company.name(),
      lastname: "owner",
      role: "RESTAURANT_OWNER",
      restaurantId: restaurant.id,
    });
    const ownerAccessToken = (
      await employeeServices.login(owner.email, ownerPassword)
    ).accessToken;

    const cardPayload = {
      benefits: faker.commerce.productDescription(),
      instruction: faker.commerce.productDescription(),
      restaurantId: restaurant.id,
      nftUrl: faker.internet.url(),
      nftImageUrl: faker.string.uuid(),
    };
    const card = await cardRepository.create(cardPayload);

    return { restaurantId: restaurant.id, ownerAccessToken, card };
  },
  createEmployee: async (restaurantId: string | null, role: ROLES) => {
    const password = faker.internet.password();
    const employee = await employeeRepository.create({
      email: faker.internet.email().toLowerCase(),
      password: await encryptionHelper.encrypt(password),
      firstname: faker.company.name(),
      lastname: faker.company.name(),
      role: role,
      restaurantId: restaurantId,
    });

    const accessToken = (await employeeServices.login(employee.email, password))
      .accessToken;

    return { employee, password, accessToken };
  },
};
