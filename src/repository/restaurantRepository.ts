import { Insertable, Updateable, sql } from "kysely";
import { Restaurant } from "../types/db/types";
import { db } from "../utils/db";

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
      .executeTakeFirstOrThrow(() => new Error("Restaurant does not exists"));

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
        "r.latitude",
        "r.longitude",
        "r.logo",
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
      .executeTakeFirstOrThrow(() => new Error("Restaurant does not exists"));

    return restaurant;
  },
  update: async (id: string, data: Updateable<Restaurant>) => {
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
};
