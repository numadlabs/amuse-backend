import { Insertable, Updateable } from "kysely";
import { db } from "../utils/db";
import { UserCard } from "../types/db/types";

export const userCardReposity = {
  create: async (data: Insertable<UserCard>) => {
    const userCard = await db
      .insertInto("UserCard")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the userCard.")
      );

    return userCard;
  },
  update: async (data: Updateable<UserCard>, id: string) => {
    const userCard = await db
      .updateTable("UserCard")
      .set(data)
      .where("UserCard.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the userCard.")
      );

    return userCard;
  },
  delete: async (id: string) => {
    const deletedUserCard = await db
      .deleteFrom("UserCard")
      .where("UserCard.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the userCard.")
      );

    return deletedUserCard;
  },
  checkExists: async (userId: string, cardId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .where("UserCard.cardId", "=", cardId)
      .where("UserCard.userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    return userCards;
  },
  getById: async (id: string) => {
    const userCard = await db
      .selectFrom("UserCard")
      .where("UserCard.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new Error("No userCard found with given id.")
      );

    return userCard;
  },
  getByUserId: async (userId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .where("UserCard.userId", "=", userId)
      .selectAll()
      .execute();

    return userCards;
  },
  getByRestaurantId: async (restaurantId: string, userId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .select([
        "UserCard.id",
        "UserCard.cardId",
        "UserCard.userId",
        "UserCard.ownedAt",
        "UserCard.visitCount",
      ])
      .where("Restaurant.id", "=", restaurantId)
      .where("UserCard.userId", "=", userId)
      .executeTakeFirst();

    return userCards;
  },
  getByUserIdRestaurantId: async (userId: string, restaurantId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .where("Card.restaurantId", "=", restaurantId)
      .where("UserCard.userId", "=", userId)
      .select([
        "UserCard.id",
        "UserCard.cardId",
        "UserCard.userId",
        "UserCard.ownedAt",
        "UserCard.visitCount",
        "UserCard.isFirstTap",
      ])
      .executeTakeFirst();

    return userCards;
  },
};
