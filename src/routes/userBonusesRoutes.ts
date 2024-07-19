import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userBonusController } from "../controllers/userBonusController";
import { authorize } from "../middlewares/authorization";
const userBonusesRoutes = express.Router();

userBonusesRoutes.post(
  "/use",
  authenticateToken,
  authorize("RESTAURANT_WAITER"),
  userBonusController.useUserBonus
);
userBonusesRoutes.get(
  "/:userCardId/userCard",
  authenticateToken,
  userBonusController.getUnusedByUserCardId
);
userBonusesRoutes.get(
  "/:restaurantId/restaurant",
  authenticateToken,
  userBonusController.getUnusedByRestaurantId
);
userBonusesRoutes.post(
  "/:id/generate",
  authenticateToken,
  authorize("USER"),
  userBonusController.generate
);
userBonusesRoutes.post("/buy", authenticateToken, userBonusController.buy);

export = userBonusesRoutes;
