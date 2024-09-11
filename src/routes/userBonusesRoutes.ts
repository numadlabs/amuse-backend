import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userBonusController } from "../controllers/userBonusController";
import { authorize } from "../middlewares/authorization";
import blockSimultaneousRequests from "../middlewares/blockSimultaneousRequests";
const userBonusesRoutes = express.Router();

userBonusesRoutes.post(
  "/use",
  authenticateToken(),
  authorize("RESTAURANT_WAITER", "RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  userBonusController.useUserBonus
);
userBonusesRoutes.get(
  "/:userCardId/userCard",
  authenticateToken(),
  authorize("USER"),
  userBonusController.getUnusedByUserCardId
);
userBonusesRoutes.get(
  "/used/:restaurantId/restaurant",
  authenticateToken(),
  authorize("USER"),
  userBonusController.getUsedByRestaurantId
);
userBonusesRoutes.get(
  "/:restaurantId/restaurant/redemption-history",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  userBonusController.getUsedByRestaurantId
);
userBonusesRoutes.get(
  "/:restaurantId/restaurant",
  authenticateToken(),
  authorize("USER"),
  userBonusController.getUnusedByRestaurantId
);
userBonusesRoutes.post(
  "/:id/generate",
  authenticateToken(),
  authorize("USER"),
  userBonusController.generate
);
userBonusesRoutes.post(
  "/:bonusId/buy",
  authenticateToken(),
  blockSimultaneousRequests,
  authorize("USER"),
  userBonusController.buy
);

export = userBonusesRoutes;
