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
restaurantRoutes.post(
  "/generate",
  authenticateToken,
  // authorize("RESTAURANT_WAITER"),
  restaurantController.generateNFC
);
restaurantRoutes.get(
  "/:id",
  authenticateToken,
  restaurantController.getRestaurantById
);
restaurantRoutes.put(
  "/:id",
  authenticateToken,
  authorize("SUPER_ADMIN"),
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
