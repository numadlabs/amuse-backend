import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Payment } from "../types/db/types";
import { paymentRepository } from "../repository/paymentRepository";
import { AuthenticatedRequest } from "../../custom";
import { paymentServices } from "../services/paymentServices";
import { userRepository } from "../repository/userRepository";
import { orderRepository } from "../repository/orderRepository";
import { CustomError } from "../exceptions/CustomError";
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
      const orderId = id;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);
      const newPaymentWithInvoice = await paymentServices.createInvoice(
        orderId
      );
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

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const result = await paymentServices.verifyInvoice(orderId, req.user.id);
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

      const result = await paymentServices.verifyInvoice(orderId, req.user.id);

      if (result.code === "success") {
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
