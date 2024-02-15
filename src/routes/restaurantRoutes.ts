import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restaurantController } from "../controllers/restaurantController";
import { authorize } from "../middlewares/authorization";
const restaurantRoutes = express.Router();

restaurantRoutes.post(
  "/restaurants",
  authenticateToken,
  authorize("SUPER_ADMIN"),
  restaurantController.createRestaurant
);
restaurantRoutes.get("/restaurants", restaurantController.getRestaurant);
restaurantRoutes.get(
  "/restaurants/:id",
  restaurantController.getRestaurantById
);
restaurantRoutes.put(
  "/restaurants/:id",
  authenticateToken,
  authorize("SUPER_ADMIN", "ADMIN"),
  restaurantController.updateRestaurant
);
restaurantRoutes.delete(
  "/restaurants/:id",
  authenticateToken,
  authorize("ADMIN"),
  restaurantController.deleteRestaurant
);
export = restaurantRoutes;
