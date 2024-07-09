import { Insertable, Updateable } from "kysely";
import { Timetable } from "../types/db/types";
import { db } from "../utils/db";

export const timetableRepository = {
  create: async (data: Insertable<Timetable>[]) => {
    const timetable = await db
      .insertInto("Timetable")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the timetable.")
      );

    return timetable;
  },
  getByRestaurantIdAndDayNo: async (restaurantId: string, dayNo: number) => {
    const timetable = await db
      .selectFrom("Timetable")
      .selectAll()
      .where("Timetable.restaurantId", "=", restaurantId)
      .where("Timetable.dayNoOfTheWeek", "=", dayNo)
      .executeTakeFirst();

    return timetable;
  },
  getById: async (id: string) => {
    const timetable = await db
      .selectFrom("Timetable")
      .selectAll()
      .where("Timetable.id", "=", id)
      .executeTakeFirst();

    return timetable;
  },
  update: async (data: Updateable<Timetable>, id: string) => {
    const timetable = await db
      .updateTable("Timetable")
      .set(data)
      .returningAll()
      .where("Timetable.id", "=", id)
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the timetable.")
      );

    return timetable;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const timetable = await db
      .selectFrom("Timetable")
      .selectAll()
      .where("Timetable.restaurantId", "=", restaurantId)
      .execute();

    return timetable;
  },
};
