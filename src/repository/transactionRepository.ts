import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { db } from "../utils/db";

export const transactionRepository = {
  create: async (data: Insertable<Transaction>) => {
    const transaction = await db
      .insertInto("Transaction")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the transaction.")
      );

    return transaction;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const transaction = await db
      .selectFrom("Transaction")
      .selectAll()
      .where("Transaction.restaurantId", "=", restaurantId)
      .execute();

    return transaction;
  },
};
