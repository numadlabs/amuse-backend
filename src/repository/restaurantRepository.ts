import { Insertable } from "kysely";
import { Restaurant } from "../types/db/types";
import { db } from "../utils/db";

export const restaurantResposity = {
  create: async (data: Insertable<Restaurant>) => {
    const restaurant = await db
      .insertInto("Restaurant")
      .values(data)
      .returningAll()
      .executeTakeFirst();

    if (!restaurant) throw new Error("Error creating restaurant");

    return restaurant;
  },
};
