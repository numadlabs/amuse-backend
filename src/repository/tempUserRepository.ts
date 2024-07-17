import { Insertable } from "kysely";
import { TempUser } from "../types/db/types";
import { db } from "../utils/db";

export const tempUserRepository = {
  create: async (data: Insertable<TempUser>) => {
    const tempUser = await db
      .insertInto("TempUser")
      .values(data)
      .returning([
        "TempUser.id",
        "TempUser.prefix",
        "TempUser.telNumber",
        "TempUser.createdAt",
      ])
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the tempUser.")
      );

    return tempUser;
  },
  getByTelNumber: async (prefix: string, telNumber: string) => {
    const tempUser = await db
      .selectFrom("TempUser")
      .selectAll()
      .where("TempUser.prefix", "=", prefix)
      .where("TempUser.telNumber", "=", telNumber)
      .orderBy("TempUser.createdAt asc")
      .executeTakeFirst();

    return tempUser;
  },
};
