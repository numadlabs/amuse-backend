import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { orderServices } from "../services/orderServices";
import { CustomError } from "../exceptions/CustomError";
import { createOrderSchema } from "../validations/orderSchema";
import { productServices } from "../services/productServices";
import {
  idSchema,
  restaurantIdSchema,
  userIdSchema,
} from "../validations/sharedSchema";

export const orderController = {
  createOrder: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { orderItems } = createOrderSchema.parse(req.body);

      if (!req.user) {
        throw new CustomError("Could not retrieve info from the token.", 400);
      }

      const updatedOrderItems = await Promise.all(
        orderItems.map(async (orderItem) => {
          const product = await productServices.getById(orderItem.productId);
          if (!product) {
            throw new CustomError("Product not found", 404);
          }
          return {
            ...orderItem,
            price: product.price,
            subtotal: product.price * orderItem.quantity,
          };
        })
      );

      const data = await orderServices.create(updatedOrderItems, req.user.id);

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (e) {
      next(e);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const data = await orderServices.getOrderById(id);

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (e) {
      next(e);
    }
  },
  //   getByUserId: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //         const { userId } = userIdSchema.parse(req.params);

  //         const orders = await orderServices.getOrderByUserId(userId);

  //     } catch (e) {
  //         next(e)
  //     }
  //   },
  getOrderByRestaurantId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

      if (!req.user) {
        throw new CustomError("Could not retrieve info from the token.", 400);
      }

      const orders = await orderServices.getOrdersByRestaurantId(
        restaurantId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        data: {
          orders: orders,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
