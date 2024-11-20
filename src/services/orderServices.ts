import { Insertable, Updateable } from "kysely";
import { Order, OrderItem } from "../types/db/types";
import { orderRepository } from "../repository/orderRepository";
import { userRepository } from "../repository/userRepository";
import { CustomError } from "../exceptions/CustomError";
import { orderItemRepository } from "../repository/orderItemRepository";
import { employeeRepository } from "../repository/employeeRepository";

export const orderServices = {
  create: async (orderItem: Insertable<OrderItem>[], issuerId: string) => {
    const user = await userRepository.getUserById(issuerId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const order = await orderRepository.create({ userId: user.id });
    const orderItems = orderItem.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    const createdOrderItems = await Promise.all(
      orderItems.map((item) => orderItemRepository.create(item))
    );

    for (const item of createdOrderItems) {
      order.subtotal += item.subtotal;
      order.total += item.subtotal;
    }

    await orderRepository.update(order.id, order);

    return { order, orderItems: createdOrderItems };
  },
  update: async (id: string, data: Updateable<Order>, issuerId: string) => {
    const user = await userRepository.getUserById(issuerId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const order = await orderRepository.getById(id);
    if (!order) {
      throw new CustomError("Order not found", 404);
    }
    if (order.userId !== user.id) {
      throw new CustomError("You can't do this action.", 401);
    }
    const updatedOrder = await orderRepository.update(id, data);
    return updatedOrder;
  },
  updateOrderItem: async (
    id: string,
    data: Updateable<OrderItem>,
    issuerId: string
  ) => {
    const user = await userRepository.getUserById(issuerId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const orderItem = await orderItemRepository.getById(id);
    if (!orderItem) {
      throw new CustomError("Order item not found", 404);
    }
    const order = await orderRepository.getById(orderItem.orderId!);
    if (!order) {
      throw new CustomError("Order not found", 404);
    }
    if (order.userId !== user.id) {
      throw new CustomError("You can't do this action.", 401);
    }
    const updatedOrderItem = await orderItemRepository.update(id, data);
    return updatedOrderItem;
  },
  getOrderById: async (id: string) => {
    const order = await orderRepository.getById(id);
    if (!order) {
      throw new CustomError("Order not found", 404);
    }
    const orderItems = await orderItemRepository.getByOrderId(order.id);
    return { order, orderItems };
  },
  getOrdersByRestaurantId: async (restaurantId: string, issuerId: string) => {
    const employee = await employeeRepository.getById(issuerId);
    if (!employee) {
      throw new CustomError("Employee not found", 404);
    }
    if (employee.restaurantId !== restaurantId) {
      throw new CustomError("You can't do this action.", 401);
    }
    const orders = await orderRepository.getOrdersByRestaurantId(restaurantId);
    return orders;
  },
  //TODO: Implement this function
  getOrdersWithRestaurantIdUserId: async (
    restaurantId: string,
    userId: string
  ) => {
    return 0;
  },
};
