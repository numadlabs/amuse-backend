import { Insertable, Kysely, Transaction, Updateable } from "kysely";
import { db } from "../utils/db";
import { DB, UserBonus } from "../types/db/types";

export const userBonusRepository = {
  create: async (
    db: Kysely<DB> | Transaction<DB>,
    data: Insertable<UserBonus>
  ) => {
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
      .where("UserBonus.isUsed", "=", false)
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
      .where("UserBonus.isUsed", "=", false)
      .select([
        "UserBonus.id",
        "UserBonus.bonusId",
        "UserBonus.userId",
        "UserBonus.userCardId",
        "UserBonus.isUsed",
        "Bonus.name",
      ])
      .execute();

    return userBonuses;
  },
  getCountByRestaurantId: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const count = await db
      .selectFrom("UserBonus as ub")
      .innerJoin("UserCard", "UserCard.id", "ub.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .select(({ fn }) => [fn.count<number>("ub.id").as("count")])
      .where("Restaurant.id", "=", restaurantId)
      .where("ub.isUsed", "=", true)
      .where("ub.usedAt", ">=", startDate)
      .where("ub.usedAt", "<", endDate)
      .executeTakeFirstOrThrow(
        () => new Error("Error fetching user's bonus data.")
      );

    return count;
  },
  getUsedByRestaurantId: async (restaurantId: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .innerJoin("UserCard", "UserCard.id", "UserBonus.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .innerJoin("Bonus", "Bonus.id", "UserBonus.bonusId")
      .innerJoin("Employee", "Employee.id", "UserBonus.waiterId")
      .innerJoin("User", "User.id", "UserBonus.userId")
      .where("Restaurant.id", "=", restaurantId)
      .where("UserBonus.isUsed", "=", true)
      .select([
        "UserBonus.id",
        "Bonus.name",
        "Bonus.type",
        "Employee.fullname",
        "User.nickname",
        "User.email",
        "User.countryId",
        "UserBonus.usedAt",
      ])
      .execute();

    return userBonuses;
  },
  getAllByUserId: async (userId: string) => {
    const userBonuses = await db
      .selectFrom("UserBonus")
      .innerJoin("UserCard", "UserCard.id", "UserBonus.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .innerJoin("Bonus", "Bonus.id", "UserBonus.bonusId")
      .where("UserBonus.userId", "=", userId)
      .select([
        "UserBonus.id",
        "Bonus.name",
        "Bonus.type",
        "Restaurant.name as restaurantName",
        "UserBonus.isUsed",
        "UserBonus.usedAt",
      ])
      .orderBy("UserBonus.usedAt", "desc")
      .execute();

    return userBonuses;
  },
};
