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
export = restaurantRoutes;
