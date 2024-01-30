import { db } from "../utils/db";

export const userRepository = {
  getUserByPhoneNumber: async (phoneNumber: string, prefix: string) => {
    const user = await db
      .selectFrom("User")
      .where("User.telNumber", "=", phoneNumber)
      .where("prefix", "=", prefix)
      .selectAll()
      .executeTakeFirst();

    return user;
  },
  getUserById: async (id: string) => {
    const user = await db
      .selectFrom("User")
      .where("User.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user;
  },
  create: async (
    nickname: string,
    prefix: string,
    telNumber: string,
    password: string
  ) => {
    const user = await db
      .insertInto("User")
      .values({
        nickname: nickname,
        prefix: prefix,
        telNumber: telNumber,
        password: password,
      })
      .returningAll()
      .executeTakeFirst();

    return user;
  },
  setOTP: async (
    id: string,
    verificationCode: number | null,
    status?: boolean
  ) => {
    const user = await db
      .updateTable("User")
      .set({
        telVerificationCode: verificationCode,
        isTelVerified: status,
      })
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return user;
  },
};
