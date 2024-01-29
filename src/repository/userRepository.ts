import { Request, Response } from "express";
import { db } from "../utils/db";
import { Prisma } from "@prisma/client";

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
};
