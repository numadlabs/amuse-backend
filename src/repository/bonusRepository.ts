import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { db } from "../utils/db";
import { CustomError } from "../exceptions/CustomError";
import { BONUS_TYPE } from "../types/db/enums";

export const bonusRepository = {
  create: async (data: Insertable<Bonus>) => {
    const bonus = await db
      .insertInto("Bonus")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't create the bonus."));

    return bonus;
  },
  update: async (data: Updateable<Bonus>, id: string) => {
    const bonus = await db
      .updateTable("Bonus")
      .where("Bonus.id", "=", id)
      .set(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't update the bonus."));

    return bonus;
  },
  delete: async (id: string) => {
    const bonus = await db
      .deleteFrom("Bonus")
      .where("Bonus.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't delete the bonus."));

    return bonus;
  },
  getByCardId: async (cardId: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.cardId", "=", cardId)
      .where("Bonus.type", "=", "RECURRING")
      .where((eb) =>
        eb("Bonus.currentSupply", "<=", eb.ref("Bonus.totalSupply"))
      )
      .selectAll()
      .execute();

    return bonus;
  },
  getByRestaurantId: async (restaurantId: string, type: BONUS_TYPE) => {
    const bonus = await db
      .selectFrom("Bonus")
      .innerJoin("Card", "Card.id", "Bonus.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .where("Restaurant.id", "=", restaurantId)
      .where("Bonus.type", "=", type)
      .where((eb) =>
        eb("Bonus.currentSupply", "<=", eb.ref("Bonus.totalSupply"))
      )
      .select([
        "Bonus.id",
        "Bonus.cardId",
        "Bonus.name",
        "Bonus.price",
        "Bonus.type",
        "Bonus.visitNo",
        "Bonus.currentSupply",
        "Bonus.totalSupply",
      ])
      .execute();

    return bonus;
  },
  getFirstTapBonus: async () => {
    const bonus = await db
      .selectFrom("Bonus")
      /* .where("Bonus.cardId", "=", null) */
      .where("Bonus.name", "=", "Free drink on the house")
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new CustomError("No Global free drink bonus found.", 500)
      );

    return bonus;
  },
  getById: async (id: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return bonus;
  },
};
