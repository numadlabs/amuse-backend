import { Updateable } from "kysely";
import { db } from "../utils/db";
import { Currency } from "../types/db/types";

export const currencyRepository = {
  getByTicker: async (ticker: string) => {
    const currency = await db
      .selectFrom("Currency")
      .selectAll()
      .where("Currency.ticker", "=", ticker)
      .executeTakeFirstOrThrow(() => new Error("Currency not found."));

    return currency;
  },
  update: async (id: string, data: Updateable<Currency>) => {
    const currency = await db
      .updateTable("Currency")
      .set(data)
      .returningAll()
      .where("Currency.id", "=", id)
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the currency.")
      );

    return currency;
  },
};
