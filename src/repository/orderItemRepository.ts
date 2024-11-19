import { Insertable, Kysely, Updateable, Transaction } from "kysely";
import { DB, OrderItem } from "../types/db/types";
import { db } from "../utils/db";

export const orderItemRepository = {
  create: async (data: Insertable<OrderItem>) => {
    const orderItem = await db
      .insertInto("OrderItem")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create an order item.")
      );

    return orderItem;
  },
  update: async (id: string, data: Updateable<OrderItem>) => {
    const orderItem = await db
      .updateTable("OrderItem")
      .set(data)
      .where("OrderItem.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the order item.")
      );

    return orderItem;
  },
  delete: async (id: string) => {
    const deletedOrderItem = await db
      .deleteFrom("OrderItem")
      .where("OrderItem.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the order item.")
      );

    return deletedOrderItem;
  },
  getById: async (id: string) => {
    const orderItem = await db
      .selectFrom("OrderItem")
      .where("OrderItem.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return orderItem;
  },
  getByOrderId: async (orderId: string) => {
    const orderItems = await db
      .selectFrom("OrderItem")
      .where("OrderItem.orderId", "=", orderId)
      .selectAll()
      .execute();

    return orderItems;
  },
  getByProductId: async (productId: string) => {
    const orderItems = await db
      .selectFrom("OrderItem")
      .where("OrderItem.productId", "=", productId)
      .selectAll()
      .execute();

    return orderItems;
  },
};
