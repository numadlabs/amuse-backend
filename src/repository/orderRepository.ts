import { Insertable, Kysely, Updateable, Transaction } from "kysely";
import { DB, Order } from "../types/db/types";
import { db } from "../utils/db";

export const orderRepository = {
  create: async (data: Insertable<Order>) => {
    const order = await db
      .insertInto("Order")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create an order."));

    return order;
  },
  update: async (id: string, data: Updateable<Order>) => {
    const order = await db
      .updateTable("Order")
      .set(data)
      .where("Order.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not update the order."));

    return order;
  },
  delete: async (id: string) => {
    const deletedOrder = await db
      .deleteFrom("Order")
      .where("Order.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not delete the order."));

    return deletedOrder;
  },
  getById: async (id: string) => {
    const order = await db
      .selectFrom("Order")
      .where("Order.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return order;
  },
  getByUserId: async (userId: string) => {
    const orders = await db
      .selectFrom("Order")
      .where("Order.userId", "=", userId)
      .selectAll()
      .execute();

    return orders;
  },
  getOrdersByRestaurantId: async (restaurantId: string) => {
    const orders = await db
      .selectFrom("Order")
      .innerJoin("OrderItem", "Order.id", "OrderItem.orderId")
      .innerJoin("Product", "OrderItem.productId", "Product.id")
      .where("Product.restaurantId", "=", restaurantId)
      .groupBy("Order.id")
      .select([
        "Order.id",
        "Order.userId",
        "Order.createdAt",
        "Order.total",
        "Order.discount",
        "Order.employeeId",
        "Order.notes",
        "Order.status",
        "Order.tax",
        "Order.serviceCharge",
        "Order.subtotal",
        "Order.tableNumber",
      ])
      .execute();
    return orders;
  },
};
