import express from "express";
import { tapController } from "../controllers/tapController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const tapRouter = express.Router();

tapRouter.post(
  "/redeem",
  authenticateToken,
  authorize("USER"),
  tapController.redeemTap
);
tapRouter.post(
  "/verify",
  authenticateToken,
  authorize("USER"),
  tapController.verifyTap
);
tapRouter.get("/:id", tapController.getTapById);

export = tapRouter;
