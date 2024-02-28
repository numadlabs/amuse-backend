import { Prisma } from "@prisma/client";
import { User } from "../types/db/types";

export const hideDataHelper = {
  sanitizeUserData: (data: Prisma.UserCreateInput | User) => {
    const { password, emailVerificationCode, telVerificationCode, ...user } =
      data;
    return user;
  },
};
