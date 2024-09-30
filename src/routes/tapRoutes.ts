import express from "express";
import { tapController } from "../controllers/tapController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const tapRouter = express.Router();

tapRouter.post(
  "/generate",
  authenticateToken(),
  authorize("USER"),
  tapController.generate
);
tapRouter.post(
  "/redeem",
  authenticateToken(),
  authorize("RESTAURANT_WAITER", "RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  tapController.redeemTap
);
// tapRouter.get("/:id", authenticateToken(), tapController.getTapById);

export = tapRouter;
