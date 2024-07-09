import { db } from "../utils/db";
import { Insertable, Updateable } from "kysely";
import { User } from "../types/db/types";

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
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .where("UserCard.userId", "=", id)
      .selectAll()
      .execute();

    return cards;
  },
  getUserBonuses: async (id: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .where("UserBonus.userId", "=", id)
      .where("UserBonus.status", "=", "UNUSED")
      .selectAll()
      .execute();

    return userBonuses;
  },
  getUserBonusesByUserCardId: async (userCardId: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .where("UserBonus.userCardId", "=", userCardId)
      .where("UserBonus.status", "=", "UNUSED")
      .selectAll()
      .execute();

    return userBonuses;
  },
  create: async (data: Insertable<User>) => {
    const user = await db
      .insertInto("User")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create the user."));

    return user;
  },
  update: async (id: string, data: Updateable<User>) => {
    const user = await db
      .updateTable("User")
      .set(data)
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not update the user."));

    return user;
  },
  delete: async (id: string) => {
    const deletedUser = await db
      .deleteFrom("User")
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not delete the user."));

    return deletedUser;
  },
};
