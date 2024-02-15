import { Insertable, Updateable } from "kysely";
import { Card, UserCard } from "../types/db/types";
import { db } from "../utils/db";

export const cardRepository = {
  create: async (data: Insertable<Card>) => {
    const card = await db
      .insertInto("Card")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error creating card."));

    return card;
  },
  update: async (id: string, data: Updateable<Card>) => {
    const card = db
      .updateTable("Card")
      .set(data)
      .where("Card.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error updating card."));

    return card;
  },
  delete: async (id: string) => {
    const card = db
      .deleteFrom("Card")
      .where("Card.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error deleting card."));

    return card;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const cards = await db
      .selectFrom("Card")
      .where("Card.restaurantId", "=", restaurantId)
      .selectAll()
      .execute();

    return cards;
  },
  getById: async (id: string) => {
    const card = await db
      .selectFrom("Card")
      .where("Card.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new Error("Card with given id does not exist.")
      );

    return card;
  },
  get: async (offset: number, limit: number) => {
    const cards = await db
      .selectFrom("Card")
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    return cards;
  },
};
