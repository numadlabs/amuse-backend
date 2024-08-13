import { Insertable } from "kysely";
import { Notification } from "../types/db/types";
import { db } from "../utils/db";

export const notificationRepository = {
  create: async (data: Insertable<Notification>) => {
    const notification = await db
      .insertInto("Notification")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Failed to create notification.")
      );

    return notification;
  },
  updateReadStateByUserId: async (userId: string) => {
    const notification = await db
      .updateTable("Notification")
      .set({ isRead: true })
      .returningAll()
      .where("Notification.userId", "=", userId)
      .executeTakeFirstOrThrow(
        () => new Error("Failed to update notification.")
      );

    return notification;
  },
  updateReadStateByEmployeeId: async (employeeId: string) => {
    const notification = await db
      .updateTable("Notification")
      .set({ isRead: true })
      .returningAll()
      .where("Notification.employeeId", "=", employeeId)
      .executeTakeFirstOrThrow(
        () => new Error("Failed to update notification.")
      );

    return notification;
  },
  getUnreadByUserId: async (userId: string) => {
    const notifications = await db
      .selectFrom("Notification")
      .selectAll()
      .where("Notification.userId", "=", userId)
      .where("Notification.isRead", "=", false)
      .execute();

    return notifications;
  },
  getUnreadByEmployeeId: async (employeeId: string) => {
    const notifications = await db
      .selectFrom("Notification")
      .selectAll()
      .where("Notification.employeeId", "=", employeeId)
      .where("Notification.isRead", "=", false)
      .execute();

    return notifications;
  },
};
