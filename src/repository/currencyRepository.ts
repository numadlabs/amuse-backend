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
  getByTickerWithBtc: async (ticker: string) => {
    const currency = await db
      .selectFrom("Currency as c1")
      .innerJoin("Currency as c2", (join) =>
        join.on("c1.ticker", "=", ticker).on("c2.ticker", "=", "BTC")
      )
      .select(["c1.price as tickerPrice", "c2.price as btcPrice"])
      .executeTakeFirstOrThrow(() => new Error("Currency not found."));

    return currency;
  },
};
