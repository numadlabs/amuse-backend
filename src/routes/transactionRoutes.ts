import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import { transactionController } from "../controllers/transactionController";
const transactionRouter = express.Router();

transactionRouter.post(
  "/deposit",
  authenticateToken,
  transactionController.deposit
);
transactionRouter.post(
  "/withdraw",
  authenticateToken,
  transactionController.withdraw
);
transactionRouter.get(
  "/:restaurantId/restaurant",
  authenticateToken,
  transactionController.getByRestaurantId
);

export = transactionRouter;
