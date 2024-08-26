import { faker } from "@faker-js/faker";
import { emailOtpRepository } from "../../../src/repository/emailOtpRepository";
import { userServices } from "../../../src/services/userServices";
import { generateVerificationToken } from "../../../src/utils/jwt";

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

    jest.resetAllMocks();

    return result;
  },
};
