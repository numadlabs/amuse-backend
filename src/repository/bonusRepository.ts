import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { db } from "../utils/db";

export const bonusReposity = {
  create: async (data: Insertable<Bonus>) => {
    const bonus = await db
      .insertInto("Bonus")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error on creating bonus."));

    return bonus;
  },
  update: async (data: Updateable<Bonus>) => {
    const bonus = await db
      .updateTable("Bonus")
      .set(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error on updating bonus."));

    return bonus;
  },
  delete: async (id: string) => {
    const bonus = await db
      .deleteFrom("Bonus")
      .where("Bonus.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error on deleting bonus."));

    return bonus;
  },
  getByCardId: async (cardId: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.cardId", "=", cardId)
      .selectAll()
      .execute();

    return bonus;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .innerJoin("Card", "Card.id", "Bonus.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.id")
      .where("Restaurant.id", "=", restaurantId)
      .select(["Bonus.id", "Bonus.cardId", "Bonus.name", "Bonus.imageUrl"])
      .execute();

    return bonus;
  },
  getById: async (id: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return bonus;
  },
};
