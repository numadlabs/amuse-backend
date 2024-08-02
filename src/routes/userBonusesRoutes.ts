import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userBonusController } from "../controllers/userBonusController";
import { authorize } from "../middlewares/authorization";
import blockSimultaneousRequests from "../middlewares/blockSimultaneousRequests";
const userBonusesRoutes = express.Router();

userBonusesRoutes.post(
  "/use",
  authenticateToken,
  authorize("RESTAURANT_WAITER", "RESTAURANT_OWNER"),
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
userBonusesRoutes.post(
  "/buy",
  authenticateToken,
  blockSimultaneousRequests,
  userBonusController.buy
);

export = userBonusesRoutes;
