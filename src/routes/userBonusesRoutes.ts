import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userBonusController } from "../controllers/userBonusController";
const userBonusesRoutes = express.Router();

userBonusesRoutes.get(
  "/:userCardId/userCard",
  authenticateToken,
  userBonusController.getByUserCardId
);
userBonusesRoutes.get(
  "/:restaurantId/restaurant",
  authenticateToken,
  userBonusController.getByRestaurantId
);
userBonusesRoutes.post(
  "/:id/use",
  authenticateToken,
  userBonusController.useUserBonus
);
userBonusesRoutes.post(
  "/redeem",
  authenticateToken,
  userBonusController.redeemUserBonus
);

export = userBonusesRoutes;
