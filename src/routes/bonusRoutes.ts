import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { bonusController } from "../controllers/bonusController";
import { authorize } from "../middlewares/authorization";
const bonusRoutes = express.Router();

bonusRoutes.post(
  "/",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  bonusController.createBonus
);
bonusRoutes.put(
  "/:id",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  bonusController.updateBonus
);
// bonusRoutes.delete(
//   "/:id",
//   authenticateToken(),
//   authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
//   bonusController.deleteBonus
// );
bonusRoutes.get(
  "/:restaurantId/restaurant",
  authenticateToken(),
  bonusController.getByRestaurantId
);

export = bonusRoutes;
