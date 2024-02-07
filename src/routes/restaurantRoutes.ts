import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restaurantController } from "../controllers/restaurantController";
const restaurantRoutes = express.Router();

restaurantRoutes.post(
  "/restaurants",
  authenticateToken,
  restaurantController.createRestaurant
);
restaurantRoutes.get("/restaurants", restaurantController.getRestaurant);
restaurantRoutes.get(
  "/restaurants/:id",
  restaurantController.getRestaurantById
);
restaurantRoutes.put("/restaurants/:id", restaurantController.updateRestaurant);
restaurantRoutes.delete(
  "/restaurants/:id",
  restaurantController.deleteRestaurant
);
export = restaurantRoutes;
