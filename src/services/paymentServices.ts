import { Prisma } from "@prisma/client";
import { paymentRepository } from "../repository/paymentRepository";
import { Insertable, Updateable } from "kysely";
import { Payment } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import {
  generate,
  verify,
  getPaymentInvoice,
  getPaymentList,
} from "../lib/qPayProviderHelper";
import { PAYMENT_STATUS } from "../types/db/enums";
import { userRepository } from "../repository/userRepository";
import { paymentLogRepository } from "../repository/paymentLogRepository";
import { randomUUID } from "crypto";
import { orderServices } from "./orderServices";
import { orderRepository } from "../repository/orderRepository";

enum PAYMENT_RESPONSE_CODES {
  PAID = "PAID",
  DECLINED = "DECLINED",
}
export const paymentServices = {
  createInvoice: async (orderId: string) => {
    const { order } = await orderServices.getOrderById(orderId);
    if (!order) {
      throw new CustomError("Order not found.", 404);
    }
    const existingPayment = await paymentRepository.getPaymentByOrderId(
      order.id
    );
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

    const invoiceNo = randomUUID();
    const data: Insertable<Payment> = {
      totalAmount: order.total,
      orderId: order.id,
      invoiceNo: invoiceNo,
    };

    const payment = await paymentRepository.create(data);

    const paymentParams = await generate({
      ...data,
      amount: payment.totalAmount,
    });

    const { providerInvoiceNo } = paymentParams;
    if (providerInvoiceNo) {
      await paymentRepository.update(payment.id, {
        providerInvoiceNo: `${providerInvoiceNo}`,
      });
    }
    return { ...paymentParams, invoiceNo: `${invoiceNo}` };
  },
  verifyInvoice: async (orderId: string, issuerId: string) => {
    // TODO optimize verification steps
    const order = await orderRepository.getById(orderId);
    if (!order) throw new CustomError("Order not found.", 404);

    if (order.userId !== issuerId) {
      throw new CustomError(
        "You are not authorized to confirm this payment.",
        403
      );
    }

    const payment = await paymentRepository.getPaymentByOrderId(orderId);
    if (!payment) throw new CustomError("Payment not found.", 404);
    const invoiceNo = payment.invoiceNo;
    const provider = "QPAY";
    if (!invoiceNo) throw new CustomError("Invoice not found.", 404);

    const paymentLog = await paymentLogRepository.create({
      invoiceNo: `${invoiceNo}`,
    });
    if (payment) {
      const result = await verify(payment);

      // update payment log
      await paymentLogRepository.update(paymentLog.id, {
        success:
          result.providerResponseCode === PAYMENT_RESPONSE_CODES.PAID ? 0 : 1,
        providerResponseCode: result.providerResponseCode,
        providerResponseDesc: result.providerResponseDesc,
      });

      const status =
        result.code === "error"
          ? PAYMENT_STATUS.DECLINED
          : PAYMENT_STATUS.APPROVED;
      // update payment status
      await paymentRepository.update(payment.id, {
        status,
        errorDesc: result.desc,
      });

      return {
        ...result,
        amount: payment.totalAmount, // discounted amount
      };
    }
    return {
      code: "error",
      desc: "Payment not found",
    };
  },
  getPaymentStatus: async (orderId: string) => {
    const payment = await getPaymentInvoice(orderId);

    return payment;
  },
  getPaymentList: async (offset: number, limit: number) => {
    const payments = await getPaymentList(offset, limit);
    return payments;
  },
};
