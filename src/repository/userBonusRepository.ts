import { Insertable, Updateable } from "kysely";
import { db } from "../utils/db";
import { UserBonus } from "../types/db/types";

export const userBonusRepository = {
  create: async (data: Insertable<UserBonus>) => {
    const userBonus = await db
      .insertInto("UserBonus")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't create userBonus."));

    return userBonus;
  },
  getById: async (id: string) => {
    const userBonus = await db
      .selectFrom("UserBonus")
      .where("UserBonus.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return userBonus;
  },
  update: async (id: string, data: Updateable<UserBonus>) => {
    const updatedUserBonus = await db
      .updateTable("UserBonus")
      .set(data)
      .where("UserBonus.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the userBonus.")
      );

    return updatedUserBonus;
  },
  getByUserCardId: async (userCardId: string) => {
    const userBonus = await db
      .selectFrom("UserBonus")
      .innerJoin("Bonus", "Bonus.id", "UserBonus.bonusId")
      .selectAll()
      .where("UserBonus.userCardId", "=", userCardId)
      .where("UserBonus.status", "=", "UNUSED")
      .execute();

    return userBonus;
  },
  getUserBonusesByRestaurantId: async (
    restaurantId: string,
    userId: string
  ) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .innerJoin("UserCard", "UserCard.id", "UserBonus.userCardId")
      .innerJoin("Bonus", "Bonus.id", "UserBonus.bonusId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .where("Card.restaurantId", "=", restaurantId)
      .where("UserBonus.userId", "=", userId)
      .where("UserBonus.status", "=", "UNUSED")
      .select([
        "UserBonus.id",
        "UserBonus.bonusId",
        "UserBonus.userId",
        "UserBonus.userCardId",
        "UserBonus.status",
        "Bonus.name",
      ])
      .execute();

    return userBonuses;
  },
};
