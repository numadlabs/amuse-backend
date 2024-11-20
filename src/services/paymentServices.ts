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

enum PAYMENT_RESPONSE_CODES {
  PAID = "PAID",
  DECLINED = "DECLINED",
}
export const paymentServices = {
  createInvoice: async (invoice: any) => {
    const invoiceNo = randomUUID();
    const { code, ...restInvoice } = invoice;
    const payment = await paymentRepository.create({
      invoiceNo,
      ...restInvoice,
    });

    const paymentParams = await generate({
      invoiceNo,
      ...restInvoice,
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
  verifyInvoice: async (verificationData: any) => {
    // TODO optimize verification steps
    const { invoiceNo } = verificationData;
    const payment = await paymentRepository.getPaymentByInvoiceNo(
      `${invoiceNo}`
    );
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
