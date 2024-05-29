import { Insertable } from "kysely";
import { Purchase } from "../types/db/types";
import { db } from "../utils/db";

export const purchaseRepository = {
  create: async (data: Insertable<Purchase>) => {
    const purchase = await db
      .insertInto("Purchase")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the purchase.")
      );

    return purchase;
  },
};
