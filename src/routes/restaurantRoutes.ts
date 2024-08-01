import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restaurantController } from "../controllers/restaurantController";
import { authorize } from "../middlewares/authorization";
import { parseFile } from "../middlewares/fileParser";
const restaurantRoutes = express.Router();

restaurantRoutes.post(
  "/",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  parseFile("logo"),
  restaurantController.createRestaurant
);
restaurantRoutes.get(
  "/",
  authenticateToken,
  restaurantController.getRestaurants
);
restaurantRoutes.put(
  "/:id/rewardDetail",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  parseFile("logo"),
  restaurantController.updateRewardDetail
);
restaurantRoutes.get(
  "/:id/asEmployee",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER"),
  restaurantController.getRestaurantByIdAsEmployee
);
restaurantRoutes.get(
  "/:id",
  authenticateToken,
  restaurantController.getRestaurantByIdAsUser
);
restaurantRoutes.put(
  "/:id",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  parseFile("logo"),
  restaurantController.updateRestaurant
);
restaurantRoutes.delete(
  "/:id",
  authenticateToken,
  authorize("SUPER_ADMIN"),
  restaurantController.deleteRestaurant
);
export = restaurantRoutes;
