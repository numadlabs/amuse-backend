import { Insertable, Updateable } from "kysely";
import { DB, Restaurant } from "../types/db/types";
import { db } from "../utils/db";

export const restaurantRepository = {
  create: async (data: Insertable<Restaurant>) => {
    const restaurant = await db
      .insertInto("Restaurant")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the restaurant.")
      );

    return restaurant;
  },
  getById: async (id: string) => {
    const restaurant = await db
      .selectFrom("Restaurant")
      .where("Restaurant.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(() => new Error("Restaurant does not exists"));

    return restaurant;
  },
  getByIdWithCardInfo: async (id: string, userId: string) => {
    const restaurant = await db
      .selectFrom("Restaurant")
      .innerJoin("Card", "Card.restaurantId", "Restaurant.id")
      .where("Restaurant.id", "=", id)
      .select(({ eb }) => [
        "Restaurant.id",
        "Restaurant.name",
        "Restaurant.description",
        "Restaurant.category",
        "Restaurant.location",
        "Restaurant.latitude",
        "Restaurant.longitude",
        "Restaurant.opensAt",
        "Restaurant.closesAt",
        "Restaurant.logo",
        "Card.id as cardId",
        "Card.benefits",
        "Card.artistInfo",
        "Card.expiryInfo",
        "Card.instruction",
        db
          .selectFrom("UserCard")
          .select(["UserCard.visitCount"])
          .where("UserCard.cardId", "=", eb.ref("Card.id"))
          .where("UserCard.userId", "=", userId)
          .limit(1)
          .as("visitCount"),
        db
          .selectFrom("UserCard")
          .select(({ eb, fn }) => [
            eb(fn.count<number>("UserCard.id"), ">", 0).as("count"),
          ])
          .where("UserCard.cardId", "=", eb.ref("Card.id"))
          .where("UserCard.userId", "=", userId)
          .as("isOwned"),
      ])
      .executeTakeFirstOrThrow(() => new Error("Restaurant does not exists"));

    return restaurant;
  },
  update: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await db
      .updateTable("Restaurant")
      .where("Restaurant.id", "=", id)
      .set(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the restaurant.")
      );

    return restaurant;
  },
  delete: async (id: string) => {
    const restaurant = await db
      .deleteFrom("Restaurant")
      .where("Restaurant.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the restaurant.")
      );

    return restaurant;
  },
};
