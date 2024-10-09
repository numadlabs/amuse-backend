import { db } from "../utils/db";
import { Insertable, Kysely, sql, Transaction, Updateable } from "kysely";
import { DB, User } from "../types/db/types";

export const userRepository = {
  getUserById: async (id: string) => {
    const user = await db
      .selectFrom("User")
      .selectAll()
      .where("User.id", "=", id)
      .executeTakeFirst();

    return user;
  },
  getUserByIdWithCountry: async (id: string) => {
    const user = await db
      .selectFrom("User")
      .leftJoin("Country", "Country.id", "User.countryId")
      .where("User.id", "=", id)
      .select([
        "User.id",
        "User.nickname",
        "User.role",
        "User.profilePicture",
        "User.balance",
        "User.birthYear",
        "User.birthMonth",
        "User.createdAt",
        "User.email",
        "User.userTierId",
        "User.password",
        "User.visitCount",
        "User.countryId",
        "Country.name as countryName",
      ])
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
      .where("UserBonus.isUsed", "=", false)
      .selectAll()
      .execute();

    return userBonuses;
  },
  getUserBonusesByUserCardId: async (userCardId: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .where("UserBonus.userCardId", "=", userCardId)
      .where("UserBonus.isUsed", "=", false)
      .selectAll()
      .execute();

    return userBonuses;
  },
  create: async (data: Insertable<User>) => {
    const user = await db
      .insertInto("User")
      .values(data)
      .returningAll()
      .onConflict((oc) => oc.column("email").doNothing())
      .executeTakeFirstOrThrow(() => new Error("Could not create the user."));

    return user;
  },
  update: async (
    db: Kysely<DB> | Transaction<DB>,
    id: string,
    data: Updateable<User>
  ) => {
    const user = await db
      .updateTable("User")
      .set(data)
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not update the user."));

    return user;
  },
  delete: async (db: Kysely<DB> | Transaction<DB>, id: string) => {
    const deletedUser = await db
      .deleteFrom("User")
      .where("User.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not delete the user."));

    return deletedUser;
  },
  getByEmail: async (email: string) => {
    const user = await db
      .selectFrom("User")
      .where("User.email", "=", email)
      .selectAll()
      .executeTakeFirst();

    return user;
  },
  getDistinctLocations: async () => {
    const locations = await db
      .selectFrom("User")
      .select(({ eb, fn }) => [
        fn
          .coalesce("User.countryId", sql<string>`'Not provided'`)
          .as("location"),
      ])
      .distinct()
      .orderBy("location desc")
      .execute();

    return locations;
  },
  cleanUp: async () => {
    await db.deleteFrom("User").execute();
  },
  acquireLockById: async (db: Kysely<DB> | Transaction<DB>, userId: string) => {
    await db
      .selectFrom("User")
      .where("id", "=", userId)
      .forUpdate()
      .noWait()
      .execute();
  },
};
