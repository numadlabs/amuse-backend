import {
  Insertable,
  Transaction,
  Updateable,
  isNoResultErrorConstructor,
} from "kysely";
import { DB, Restaurant } from "../types/db/types";
import { db } from "../utils/db";

export const restaurantRepository = {
  create: async (data: Insertable<Restaurant>) => {
    const restaurant = await db
      .insertInto("Restaurant")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Error creating restaurant"));

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
  update: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await db
      .updateTable("Restaurant")
      .where("Restaurant.id", "=", id)
      .set(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Error updating the restaurant")
      );

    return restaurant;
  },
  delete: async (id: string) => {
    const restaurant = await db
      .deleteFrom("Restaurant")
      .where("Restaurant.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Error deleting the restaurant")
      );

    return restaurant;
  },
};
