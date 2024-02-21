import { Insertable, Updateable } from "kysely";
import { Tap } from "../types/db/types";
import { db } from "../utils/db";

export const tapRepository = {
  create: async (data: Insertable<Tap>) => {
    const tap = await db
      .insertInto("Tap")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create the tap."));

    return tap;
  },
  getTapById: async (id: string) => {
    const tap = await db
      .selectFrom("Tap")
      .where("Tap.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(() => new Error("No tap was found"));

    return tap;
  },
  update: async (id: string, data: Updateable<Tap>) => {
    const tap = await db
      .updateTable("Tap")
      .where("Tap.id", "=", id)
      .set(data)
      .executeTakeFirstOrThrow(() => new Error("Could not update the tap."));

    return tap;
  },
};
