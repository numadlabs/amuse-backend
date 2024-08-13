import { Insertable, Kysely, Transaction, Updateable } from "kysely";
import { DB, Tap } from "../types/db/types";
import { db } from "../utils/db";
import { CustomError } from "../exceptions/CustomError";

export const tapRepository = {
  create: async (db: Kysely<DB> | Transaction<DB>, data: Insertable<Tap>) => {
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
      .executeTakeFirstOrThrow(() => new CustomError("No tap found.", 404));

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
        () => new CustomError("Could not retrieve the data.", 404)
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
        () => new CustomError("Could not retrieve the data.", 404)
      );

    return count;
  },
  getAllByUserId: async (userId: string) => {
    const taps = await db
      .selectFrom("Tap")
      .innerJoin("UserCard", "UserCard.id", "Tap.userCardId")
      .innerJoin("Card", "Card.id", "UserCard.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .where("UserCard.userId", "=", userId)
      .select([
        "Tap.id",
        "Tap.amount",
        "Tap.tappedAt",
        "Restaurant.name as restaurantName",
      ])
      .orderBy("Tap.tappedAt", "desc")
      .execute();

    return taps;
  },
};
