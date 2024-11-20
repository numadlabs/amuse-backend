import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Payment } from "../types/db/types";
import { paymentRepository } from "../repository/paymentRepository";
import { orderItemRepository } from "../repository/orderItemRepository";
import { AuthenticatedRequest } from "../../custom";
import { paymentServices } from "../services/paymentServices";
import { userRepository } from "../repository/userRepository";
import { orderRepository } from "../repository/orderRepository";
import { CustomError } from "../exceptions/CustomError";
import { orderServices } from "../services/orderServices";
import { idSchema } from "../validations/sharedSchema";
import { orderIdSchema } from "../validations/orderSchema";

export const paymentController = {
  createPayment: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const existingPayment = await paymentRepository.getPaymentByOrderId(id);

      if (existingPayment) {
        if (
          existingPayment.status === "DECLINED" ||
          existingPayment.status === "REQUESTED"
        ) {
          await paymentRepository.delete(existingPayment.id);
        } else {
          throw new CustomError("Payment is already done.", 400);
        }
      }

      const { order } = await orderServices.getOrderById(id);
      if (!order) {
        throw new CustomError("Order not found.", 404);
      }

      const data: Insertable<Payment> = {
        ...req.body,
        totalAmount: order.total,
        orderId: id,
      };

      if (data.id) {
        throw new CustomError(
          "Cannot set id field. It is auto-generated.",
          400
        );
      }

      const newPaymentWithInvoice = await paymentServices.createInvoice({
        ...data,
        createdAt: new Date(),
      });
      return res
        .status(200)
        .json({ success: true, data: newPaymentWithInvoice });
    } catch (e) {
      next(e);
    }
  },
  checkQpay: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = orderIdSchema.parse(req.params);

      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      if (!payment) throw new CustomError("Payment not found.", 404);

      const invoiceNo = payment.invoiceNo;
      const result = await paymentServices.verifyInvoice({
        invoiceNo,
        provider: "QPAY",
      });
      if (result && result.code === "success") {
        return res.status(200).json({ success: true, data: result });
      }
      return res
        .status(400)
        .json({ success: false, data: null, error: result });
    } catch (e) {
      next(e);
    }
  },
  getPaymentByOrderId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = orderIdSchema.parse(req.params);
      const payment = await paymentServices.getPaymentStatus(orderId);

      return res.status(200).json({ success: true, data: payment });
    } catch (e) {
      next(e);
    }
  },
  deletePaymentByOrderId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = orderIdSchema.parse(req.params);
      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      if (!payment) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "Payment not found.",
        });
      }

      const deletedPayment = await paymentRepository.delete(payment.id);

      return res.status(200).json({ success: true, data: deletedPayment });
    } catch (e) {
      next(e);
    }
  },
  confirmPaymentByOrderId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = orderIdSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const user = await userRepository.getUserById(req.user.id);
      if (!user) throw new CustomError("User not found.", 404);

      const order = await orderRepository.getById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "Order not found.",
        });
      }
      if (order.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          data: null,
          error: "You are not authorized to confirm this payment.",
        });
      }
      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      if (!payment || payment.rewardReceived === true) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "There has been a payment error.",
        });
      }

      const invoiceNo = payment.invoiceNo;
      const result = await paymentServices.verifyInvoice({ invoiceNo });

      if (result.code === "success") {
        // await userRepository.updateAsKysely(user.id, {
        //   balance: (user?.balance + payment.totalAmount / 100) as number,
        // });
        // await transactionsRepository.create({
        //   userId: user.id,
        //   amount: payment.totalAmount / 100,
        //   type: "POSITIVE",
        // });
        // await paymentRepository.update(payment.id, { rewardReceived: true });
        return res.status(200).json({
          success: true,
          data: {
            message: "Payment confirmed successfully.",
          },
          error: null,
        });
      }
      throw new CustomError("Payment verification failed.", 400);
    } catch (e) {
      next(e);
    }
  },
  getPaymentList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = 1; // fix
      const limit = 10; // fix
      const payments = await paymentServices.getPaymentList(offset, limit);
      return res
        .status(200)
        .json({ success: true, data: { payments: payments } });
    } catch (e) {
      next(e);
    }
  },
};
