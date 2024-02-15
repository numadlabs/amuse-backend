import { UserCard } from "@prisma/client";
import { Insertable } from "kysely";
import { db } from "../utils/db";

export const userCardReposity = {
  create: async (data: Insertable<UserCard>) => {
    const userCard = await db
      .insertInto("UserCard")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error creating userCard."));

    return userCard;
  },
  delete: async (id: string) => {
    const deletedUserCard = await db
      .deleteFrom("UserCard")
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error deleting userCard."));

    return deletedUserCard;
  },
  checkExists: async (userId: string, cardId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .where("UserCard.cardId", "=", cardId)
      .where("UserCard.userId", "=", userId)
      .selectAll()
      .execute();

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
  //jishee ni ene dr orderBy desc, visitCount tedees deesh ntrig ExpressionBuilder avaad where-luu hiih --> more reusable
  getByRestaurantId: async (restaurantId: string) => {
    const userCards = await db
      .selectFrom("UserCard")
      .innerJoin("Restaurant", "Restaurant.id", "UserCard.id")
      .select([
        "UserCard.id",
        "UserCard.cardId",
        "UserCard.mintedAt",
        "UserCard.userId",
        "UserCard.ownedAt",
        "UserCard.visitCount",
      ])
      .where("Restaurant.id", "=", restaurantId)
      .execute();

    return userCards;
  },
};
