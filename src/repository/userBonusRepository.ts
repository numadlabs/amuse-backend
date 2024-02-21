import { Updateable } from "kysely";
import { db } from "../utils/db";
import { UserBonus } from "@prisma/client";

export const userBonusRepository = {
  getById: async (id: string) => {
    const userBonus = await db
      .selectFrom("UserBonus")
      .where("UserBonus.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return userBonus;
  },
  update: async (id: string, data: Updateable<UserBonus>) => {
    const updatedUserBonus = await db
      .updateTable("UserBonus")
      .set(data)
      .where("UserBonus.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the userBonus.")
      );

    return updatedUserBonus;
  },
};
