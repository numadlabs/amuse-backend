import { Prisma } from "@prisma/client";
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
  create: async (data: Prisma.UserCreateInput) => {
    const user = await db
      .insertInto("User")
      .values(data)
      .returningAll()
      .executeTakeFirst();

    if (!user) throw new Error("Error inserting into DB");

    return user;
  },
  update: async (id: string, data: Prisma.UserCreateInput) => {
    const user = await db
      .updateTable("User")
      .set(data)
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!user) throw new Error("Error updating the DB");

    return user;
  },
};
