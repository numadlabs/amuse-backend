import { Insertable, Kysely, Transaction, Updateable, sql } from "kysely";
import { DB, Restaurant } from "../types/db/types";
import { db } from "../utils/db";
import { CustomError } from "../exceptions/CustomError";

export const restaurantRepository = {
  create: async (data: Insertable<Restaurant>) => {
    const restaurant = await db
      .insertInto("Restaurant")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the restaurant.")
      );

    return restaurant;
  },
  getById: async (id: string) => {
    const restaurant = await db
      .selectFrom("Restaurant")
      .where("Restaurant.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new CustomError("No restaurant found.", 404)
      );

    return restaurant;
  },
  getByIdWithCardInfo: async (
    id: string,
    userId: string,
    time: string,
    dayNo: number
  ) => {
    const restaurant = await db
      .selectFrom("Restaurant as r")
      .innerJoin("Card", "Card.restaurantId", "r.id")
      .innerJoin("Category", "Category.id", "r.categoryId")
      .where("r.id", "=", id)
      .select(({ eb }) => [
        "r.id",
        "r.name",
        "r.description",
        "r.categoryId",
        "Category.name as categoryName",
        "r.location",
        "r.googleMapsUrl",
        "r.latitude",
        "r.longitude",
        "r.logo",
        "r.rewardAmount",
        "r.perkOccurence",
        "r.balance",
        "Card.id as cardId",
        "Card.benefits",
        "Card.instruction",
        "Card.nftImageUrl",
        db
          .selectFrom("UserCard")
          .select(["UserCard.visitCount"])
          .where("UserCard.cardId", "=", eb.ref("Card.id"))
          .where("UserCard.userId", "=", userId)
          .limit(1)
          .as("visitCount"),
        db
          .selectFrom("UserCard")
          .select(({ eb, fn }) => [
            eb(fn.count<number>("UserCard.id"), ">", 0).as("count"),
          ])
          .where("UserCard.cardId", "=", eb.ref("Card.id"))
          .where("UserCard.userId", "=", userId)
          .as("isOwned"),
        sql`
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM "Timetable" t
                    WHERE t."restaurantId" = r."id"
                      AND t."dayNoOfTheWeek" = ${dayNo}
                      AND (
                          (CAST(t."closesAt" AS TIME) < CAST(t."opensAt" AS TIME)
                          AND CAST(${time} AS TIME) > CAST(t."closesAt" AS TIME)
                          AND CAST(${time} AS TIME) < CAST(t."opensAt" AS TIME))
                        OR 
                          (CAST(t."closesAt" AS TIME) > CAST(t."opensAt" AS TIME)
                          AND CAST(${time} AS TIME) > CAST(t."closesAt" AS TIME))
                          OR (CAST(${time} AS TIME) < CAST(t."opensAt" AS TIME))
                        OR (CAST(t."closesAt" AS TIME) IS NULL OR CAST(t."opensAt" AS TIME) IS NULL OR t."isOffDay" IS TRUE)
                      )
                ) THEN false
                ELSE true
            END
          `.as("isOpen"),
      ])
      .executeTakeFirstOrThrow(
        () => new CustomError("No restaurant found.", 404)
      );

    return restaurant;
  },
  update: async (
    db: Kysely<DB> | Transaction<DB>,
    id: string,
    data: Updateable<Restaurant>
  ) => {
    const restaurant = await db
      .updateTable("Restaurant")
      .where("Restaurant.id", "=", id)
      .set(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the restaurant.")
      );

    return restaurant;
  },
  delete: async (id: string) => {
    const restaurant = await db
      .deleteFrom("Restaurant")
      .where("Restaurant.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the restaurant.")
      );

    return restaurant;
  },
  count: async () => {
    const cards = await db
      .selectFrom("Restaurant")
      .select(({ fn }) => [fn.count<number>("Restaurant.id").as("count")])
      .executeTakeFirstOrThrow(
        () => new Error("Couldn't count the restaurant.")
      );

    return cards;
  },
  increaseBalanceByRestaurantId: async (
    restaurantId: string,
    amount: number
  ) => {
    const restaurant = await db
      .updateTable("Restaurant as r")
      .where("r.id", "=", restaurantId)
      .set({ balance: sql`r."balance" + ${amount}` })
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the restaurant.")
      );

    return restaurant;
  },
  get: async () => {
    const restaurants = await db
      .selectFrom("Restaurant")
      .innerJoin("Card", "Card.restaurantId", "Restaurant.id")
      .select(["Restaurant.id", "Card.id as cardId"])
      .execute();

    return restaurants;
  },
  decrementBalanceById: async (
    db: Kysely<DB> | Transaction<DB>,
    id: string,
    amount: number
  ) => {
    const restaurant = await db
      .updateTable("Restaurant")
      .set((eb) => ({ balance: eb("Restaurant.balance", "-", amount) }))
      .where("Restaurant.id", "=", id)
      .where("Restaurant.balance", ">=", amount)
      .returning(["Restaurant.balance"])
      .executeTakeFirstOrThrow(
        () => new Error("Could not decrement the restaurant balance.")
      );

    return restaurant;
  },
};
