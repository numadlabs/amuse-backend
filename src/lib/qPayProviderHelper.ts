import dotenv from "dotenv";
import axios from "axios";
import moment from "moment-timezone";
import { paymentRepository } from "../repository/paymentRepository";
import { CustomError } from "../exceptions/CustomError";
// import paymentRepo from "../repository/paymentRepository";

dotenv.config();

let authObj = {};
const {
  BASE_URL,
  QPAY_V2_URL,
  QPAY_USERNAME,
  QPAY_PASSWORD,
  QPAY_INVOICE_CODE,
  PORT,
} = process.env;

async function auth() {
  const URL = `${QPAY_V2_URL}/auth/token`;
  const auth = { username: QPAY_USERNAME, password: QPAY_PASSWORD };
  // @ts-ignore
  const response = await axios.post(URL, { withCredentials: true }, { auth });

  authObj = response.data;

  return authObj;
}

async function getToken() {
  if (authObj) {
    // @ts-ignore
    const { expires_in, access_token } = authObj;
    const isValid = moment(expires_in).isAfter(moment());
    if (isValid) {
      return access_token;
    }
  }
  const resp = await auth();

  // @ts-ignore
  return resp.access_token;
}

async function getAuthHeader() {
  const token = await getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

// @ts-ignore
export async function generate(transactionData) {
  const { amount, invoiceNo, expireAt } = transactionData;

  const invoiceDueDate = expireAt
    ? moment(expireAt)
        .add(3, "hours")
        .tz("Asia/Ulaanbaatar")
        .format("YYYY-MM-DD HH:mm:ss")
    : null;

  const URL = `${QPAY_V2_URL}/invoice`;
  const CALLBACK_URL = `${BASE_URL}:${PORT}/webhook?qpay_payment_id=${invoiceNo}`;
  const body = {
    invoice_code: QPAY_INVOICE_CODE,
    sender_invoice_no: invoiceNo,
    invoice_receiver_code: "terminal",
    invoice_description: `Niji - Mongolia ${amount} төлбөр`,
    invoice_due_date: invoiceDueDate, // FIX ME its not working
    amount,
    callback_url: CALLBACK_URL,
  };
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(URL, body, { headers });
    const invoiceData = response.data;
    return {
      providerInvoiceNo: invoiceData.id,
      ...invoiceData,
    };
  } catch (e) {
    // throw new CustomError("Failed to generate invoice", 500);
    return e as string;
  }
}

// @ts-ignore
export async function verify({ invoiceNo }) {
  const paymentInfo = await paymentRepository.getPaymentByInvoiceNo(invoiceNo);
  const URL = `${QPAY_V2_URL}/payment/check`;
  const body = {
    object_type: "INVOICE",
    object_id: paymentInfo.invoiceNo,
    offset: {
      page_number: 1,
      page_limit: 100,
    },
  };
  const headers = await getAuthHeader();
  const response = await axios.post(URL, body, { headers });
  const paymentData = response.data;

  const { count, paid_amount, rows } = paymentData;
  const isPaid = Math.round(paymentInfo.totalAmount) === paid_amount;
  const payment_status = isPaid ? "PAID" : "UNPAID";
  const msg = {
    code: "error",
    desc: "Unknown error",
    providerResponseCode: payment_status,
    providerResponseDesc: JSON.stringify(paymentData),
  };

  if (payment_status === "PAID") {
    msg.code = "success";
    msg.desc = "";
    // @ts-ignore
    msg.amount = paid_amount;
    return msg;
  }
  return msg;
}

// @ts-ignore
export async function getPaymentInvoice(orderId: string) {
  const paymentInfo = await paymentRepository.getPaymentByOrderId(orderId);
  if (!paymentInfo) {
    throw new CustomError("Payment not found", 404);
  }
  const URL = `${QPAY_V2_URL}/payment/${paymentInfo.id}`;
  const body = {
    payment_id: paymentInfo.id,
  };
  try {
    const headers = await getAuthHeader();
    const response = await axios.get(URL, { headers });

    const paymentResponse = response.data;

    return { paymentInfo, paymentResponse };
  } catch (e) {
    return e as string;
  }
}

export async function getPaymentList(offset: number, limit: number) {
  const URL = `${QPAY_V2_URL}/payment/list`;
  const body = {
    object_type: "MERCHANT",
    object_id: QPAY_INVOICE_CODE,
    start_date: moment
      .tz("2024-07-02", "Asia/Ulaanbaatar")
      .format("YYYY-MM-DD"),
    end_date: moment
      .tz("2024-07-02", "Asia/Ulaanbaatar")
      .add(3, "days")
      .format("YYYY-MM-DD"),
    offset: {
      page_number: 1,
      page_limit: 10,
    },
  };
  try {
    const headers = await getAuthHeader();
    console.log(headers, URL);
    const response = await axios.post(URL, body, { headers });
    console.log(response);

    const paymentResponse = response.data;

    return paymentResponse;
  } catch (e) {
    return e as string;
  }
}

// @ts-ignore
export async function cancelInvoice({ invoiceNo }) {
  const paymentInfo = await paymentRepository.getPaymentByInvoiceNo(invoiceNo);
  const URL = `${QPAY_V2_URL}/invoice/${paymentInfo.id}`;
  const headers = await getAuthHeader();
  const response = await axios.delete(URL, { headers });

  let msg = {
    code: "error",
    desc: "Unknown error",
    providerResponseCode: response.status,
    providerResponseDesc: JSON.stringify(response.data),
  };

  if (response.status === 200) {
    msg.code = "success";
    msg.desc = "";
    // @ts-ignore
    msg.amount = paid_amount;
    return msg;
  }

  return msg;
}
