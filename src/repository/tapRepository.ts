import { Insertable, Updateable } from "kysely";
import { Tap } from "../types/db/types";
import { db } from "../utils/db";

export const tapRepository = {
  create: async (data: Insertable<Tap>) => {
    const tap = await db
      .insertInto("Tap")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create the tap."));

    return tap;
  },
  getTapById: async (id: string) => {
    const tap = await db
      .selectFrom("Tap")
      .where("Tap.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(() => new Error("No tap was found"));

    return tap;
  },
  update: async (id: string, data: Updateable<Tap>) => {
    const tap = await db
      .updateTable("Tap")
      .where("Tap.id", "=", id)
      .set(data)
      .executeTakeFirstOrThrow(() => new Error("Could not update the tap."));

    return tap;
  },
  getTotalAmountByRestaurantId: async (restaurantId: string) => {
    const amount = await db
      .selectFrom("Tap")
      .innerJoin("UserCard", "UserCard.id", "Tap.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .select(({ fn }) => [fn.sum<number>("Tap.amount").as("totalAmount")])
      .where("Restaurant.id", "=", restaurantId)
      .executeTakeFirstOrThrow(
        () => new Error("Error fetching check-in data.")
      );

    return amount;
  },
  getCountByRestaurantId: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const count = await db
      .selectFrom("Tap")
      .innerJoin("UserCard", "UserCard.id", "Tap.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .select(({ fn }) => [fn.count<number>("Tap.id").as("count")])
      .where("Restaurant.id", "=", restaurantId)
      .where("Tap.tappedAt", ">=", startDate)
      .where("Tap.tappedAt", "<", endDate)
      .executeTakeFirstOrThrow(
        () => new Error("Error fetching check-in data.")
      );

    return count;
  },
};
