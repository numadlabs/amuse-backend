import { Insertable, Updateable } from "kysely";
import { Invite } from "../types/db/types";
import { db } from "../utils/db";

export const inviteRepository = {
  create: async (data: Insertable<Invite>) => {
    const invite = await db
      .insertInto("Invite")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create the invite."));

    return invite;
  },
  update: async (data: Updateable<Invite>, id: string) => {
    const invite = await db
      .updateTable("Invite")
      .set(data)
      .returningAll()
      .where("Invite.id", "=", id)
      .executeTakeFirstOrThrow(() => new Error("Could not create the invite."));

    return invite;
  },
  getById: async (id: string) => {
    const invite = await db
      .selectFrom("Invite")
      .selectAll()
      .where("Invite.id", "=", id)
      .executeTakeFirst();

    return invite;
  },
};
