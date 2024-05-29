import { Insertable, Updateable } from "kysely";
import { Card } from "../types/db/types";
import { db } from "../utils/db";

export const cardRepository = {
  create: async (data: Insertable<Card>) => {
    const card = await db
      .insertInto("Card")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't create the card."));

    return card;
  },
  update: async (id: string, data: Updateable<Card>) => {
    const card = db
      .updateTable("Card")
      .set(data)
      .where("Card.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't update the card."));

    return card;
  },
  delete: async (id: string) => {
    const card = db
      .deleteFrom("Card")
      .where("Card.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't delete the card."));

    return card;
  },
  getByRestaurantId: async (restaurantId: string, userId: string) => {
    const cards = await db
      .selectFrom("Card")
      .where("Card.restaurantId", "=", restaurantId)
      .select(({ eb }) => [
        "Card.id",
        "Card.artistInfo",
        "Card.benefits",
        "Card.createdAt",
        "Card.expiryInfo",
        "Card.instruction",
        "Card.mintedAt",
        "Card.nftImageUrl",
        "Card.restaurantId",
        db
          .selectFrom("UserCard")
          .select(({ eb, fn }) => [
            eb(fn.count<number>("UserCard.id"), ">", 0).as("count"),
          ])
          .where("UserCard.cardId", "=", eb.ref("Card.id"))
          .where("UserCard.userId", "=", userId)
          .as("isOwned"),
      ])
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
