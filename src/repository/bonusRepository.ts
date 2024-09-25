import { Insertable, Kysely, Transaction, Updateable } from "kysely";
import { Bonus, DB } from "../types/db/types";
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
  update: async (
    db: Kysely<DB> | Transaction<DB>,
    data: Updateable<Bonus>,
    id: string
  ) => {
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
  getByCardId: async (cardId: string, type: BONUS_TYPE) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.cardId", "=", cardId)
      .where("Bonus.type", "=", "RECURRING")
      .where((eb) =>
        eb("Bonus.currentSupply", "<", eb.ref("Bonus.totalSupply"))
      )
      .where("Bonus.type", "=", type)
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
        eb("Bonus.currentSupply", "<", eb.ref("Bonus.totalSupply"))
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
  getByRestaurantIdAndVisitNo: async (
    restaurantId: string,
    visitNo: number
  ) => {
    const bonus = await db
      .selectFrom("Bonus")
      .innerJoin("Card", "Card.id", "Bonus.cardId")
      .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
      .where("Restaurant.id", "=", restaurantId)
      .where("Bonus.type", "=", "SINGLE")
      .where("Bonus.visitNo", "=", visitNo)
      .where((eb) =>
        eb("Bonus.currentSupply", "<", eb.ref("Bonus.totalSupply"))
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
      .executeTakeFirst();

    return bonus;
  },
  getById: async (id: string) => {
    const bonus = await db
      .selectFrom("Bonus")
      .where("Bonus.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(() => new CustomError("No bonus found.", 404));

    return bonus;
  },
  getAvailableBonusesByCardId: async (cardId: string) => {
    const bonuses = await db
      .selectFrom("Bonus")
      .selectAll()
      .where("Bonus.cardId", "=", cardId)
      .where((eb) =>
        eb("Bonus.currentSupply", "<", eb.ref("Bonus.totalSupply"))
      )
      .execute();

    return bonuses;
  },
  incrementCurrentSupplyById: async (
    db: Kysely<DB> | Transaction<DB>,
    id: string
  ) => {
    const bonus = await db
      .updateTable("Bonus")
      .set((eb) => ({ currentSupply: eb("Bonus.currentSupply", "+", 1) }))
      .where("Bonus.id", "=", id)
      .where((eb) =>
        eb("Bonus.currentSupply", "<", eb.ref("Bonus.totalSupply"))
      )
      .returning(["Bonus.currentSupply", "Bonus.totalSupply"])
      .executeTakeFirstOrThrow(
        () => new Error("Could not increment the bonus current supply.")
      );

    return bonus;
  },
};
