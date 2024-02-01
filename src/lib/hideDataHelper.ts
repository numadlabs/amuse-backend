import { Prisma } from "@prisma/client";

export const hideDataHelper = {
  sanitizeUserData: (data: Prisma.UserCreateInput) => {
    const { password, emailVerificationCode, telVerificationCode, ...user } =
      data;
    return user;
  },
};
