import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import { transactionController } from "../controllers/transactionController";
const transactionRouter = express.Router();

transactionRouter.post(
  "/deposit",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  transactionController.deposit
);
transactionRouter.post(
  "/withdraw",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "USER"),
  transactionController.withdraw
);
transactionRouter.get(
  "/:restaurantId/restaurant",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  transactionController.getByRestaurantId
);
transactionRouter.get(
  "/:userId/user",
  authenticateToken,
  authorize("USER"),
  transactionController.getByUserId
);

export = transactionRouter;
