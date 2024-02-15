import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userBonusController } from "../controllers/userBonusController";
const userBonusesRouter = express.Router();

userBonusesRouter.post(
  "/userBonuses/:id/use",
  authenticateToken,
  userBonusController.useUserBonus
);
userBonusesRouter.post(
  "/userBonuses/:id/redeem",
  authenticateToken,
  userBonusController.redeemUserBonus
);
