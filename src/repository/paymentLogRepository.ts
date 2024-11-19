import { Insertable, Updateable } from "kysely";
import { PaymentLog } from "../types/db/types";
import { db } from "../utils/db";
import { create } from "domain";

export const paymentLogRepository = {
  getById: async (id: string) => {
    const paymentLog = await db
      .selectFrom("PaymentLog")
      .where("PaymentLog.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new Error("Couldn't get the payment log.")
      );
    return paymentLog;
  },
  getByInvoiceNo: async (invoiceNo: string) => {
    const paymentLog = await db
      .selectFrom("PaymentLog")
      .where("PaymentLog.invoiceNo", "=", invoiceNo)
      .selectAll()
      .executeTakeFirstOrThrow(
        () => new Error("Couldn't get the payment log.")
      );
    return paymentLog;
  },
  getAll: async (offset: number, limit: number) => {
    const paymentLogs = await db
      .selectFrom("PaymentLog")
      .selectAll()
      .limit(limit)
      .offset(offset)
      .execute();
    return paymentLogs;
  },
  create: async (data: Insertable<PaymentLog>) => {
    const paymentLog = await db
      .insertInto("PaymentLog")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Couldn't create the payment log.")
      );
    return paymentLog;
  },
  update: async (id: string, data: Updateable<PaymentLog>) => {
    const paymentLog = await db
      .updateTable("PaymentLog")
      .set(data)
      .where("PaymentLog.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Couldn't update the payment log.")
      );
    return paymentLog;
  },
};
