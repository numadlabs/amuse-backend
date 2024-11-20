import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { orderController } from "../controllers/orderController";
import { authorize } from "../middlewares/authorization";
import { parseFile } from "../middlewares/fileParser";
import { paymentController } from "../controllers/paymentController";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  authenticateToken(),
  authorize("USER"),
  orderController.createOrder
);

// orderRouter.get(
//   "/restaurant/restaurantId",
//   authenticateToken(),
//   authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER", "RESTAURANT_WAITER"),
//   orderController.getOrderByRestaurantId
// );

orderRouter.get("/:id", orderController.getById);

orderRouter.post(
  "/:id/pay",
  authenticateToken(),
  authorize("USER"),
  paymentController.createPayment
);
orderRouter.get("/:orderId/pay", paymentController.getPaymentByOrderId);
orderRouter.delete("/:orderId/pay", paymentController.deletePaymentByOrderId);
orderRouter.patch(
  "/:orderId/pay/confirm",
  authenticateToken(),
  paymentController.confirmPaymentByOrderId
);
orderRouter.patch(
  "/:orderId/pay/verify",
  authenticateToken(),
  paymentController.checkQpay
);
orderRouter.post("/payment/list", paymentController.getPaymentList);

export = orderRouter;
