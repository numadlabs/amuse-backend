import { Insertable, Updateable } from "kysely";
import { Payment } from "../types/db/types";
import { db } from "../utils/db";

export const paymentRepository = {
  create: async (data: Insertable<Payment>) => {
    const payment = await db
      .insertInto("Payment")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't create the payment."));

    return payment;
  },
  update: async (id: string, data: Updateable<Payment>) => {
    const payment = db
      .updateTable("Payment")
      .set(data)
      .where("Payment.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't update the payment."));

    return payment;
  },
  delete: async (id: string) => {
    const payment = db
      .deleteFrom("Payment")
      .where("Payment.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't delete the payment."));

    return payment;
  },
  getPaymentById: async (id: string) => {
    const payment = await db
      .selectFrom("Payment")
      .where("Payment.id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't get the payment."));

    return payment;
  },
  get: async (offset: number, limit: number) => {
    const payments = await db
      .selectFrom("Payment")
      .selectAll()
      .limit(limit)
      .offset(offset)
      .execute();

    return payments;
  },
  getPaymentByOrderId: async (orderId: string) => {
    const payments = await db
      .selectFrom("Payment")
      .where("Payment.orderId", "=", orderId)
      .selectAll()
      // .executeTakeFirstOrThrow(() => new Error("Couldn't get the payment."));
      .executeTakeFirst();
    return payments;
  },
  getPaymentByInvoiceNo: async (invoiceNo: string) => {
    const payment = await db
      .selectFrom("Payment")
      .where("Payment.invoiceNo", "=", invoiceNo)
      .selectAll()
      .executeTakeFirstOrThrow(() => new Error("Couldn't get the payment."));

    return payment;
  },
};
