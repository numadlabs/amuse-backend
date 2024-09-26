import { Insertable, Updateable } from "kysely";
import { Device } from "../types/db/types";
import { db } from "../utils/db";

export const deviceRepository = {
  create: async (data: Insertable<Device>) => {
    const device = await db
      .insertInto("Device")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not register the device.")
      );

    return device;
  },
  get: async () => {
    const device = await db.selectFrom("Device").selectAll().execute();

    return device;
  },
  getByPushToken: async (pushToken: string) => {
    const device = await db
      .selectFrom("Device")
      .selectAll()
      .where("Device.pushToken", "=", pushToken)
      .executeTakeFirst();

    return device;
  },
  updateByToken: async (data: Updateable<Device>, pushToken: string) => {
    const device = await db
      .updateTable("Device")
      .set(data)
      .returningAll()
      .where("Device.pushToken", "=", pushToken)
      .executeTakeFirstOrThrow(() => new Error("Could not update device."));

    return device;
  },
};
