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
  getUserTaps: async (id: string) => {
    const taps = await db
      .selectFrom("Tap")
      .where("Tap.userId", "=", id)
      .selectAll()
      .execute();

    return taps;
  },
  getUserCards: async (id: string) => {
    const cards = await db
      .selectFrom("UserCard")
      .where("UserCard.userId", "=", id)
      .selectAll()
      .execute();

    return cards;
  },
  getUserBonuses: async (id: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .where("UserBonus.userId", "=", id)
      .selectAll()
      .execute();

    return userBonuses;
  },
  getUserBonusesByUserCardId: async (userCardId: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .where("UserBonus.userCardId", "=", userCardId)
      .selectAll()
      .execute();

    return userBonuses;
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
  delete: async (id: string) => {
    const deletedUser = await db
      .deleteFrom("User")
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!deletedUser) throw new Error("Error updating the DB");
    return deletedUser;
  },
};
