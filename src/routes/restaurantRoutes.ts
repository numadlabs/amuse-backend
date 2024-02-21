import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restaurantController } from "../controllers/restaurantController";
import { authorize } from "../middlewares/authorization";
const restaurantRoutes = express.Router();

restaurantRoutes.post(
  "/",
  authenticateToken,
  authorize("SUPER_ADMIN"),
  restaurantController.createRestaurant
);
restaurantRoutes.get("/", restaurantController.getRestaurant);
restaurantRoutes.get("/:id", restaurantController.getRestaurantById);
restaurantRoutes.put(
  "/:id",
  authenticateToken,
  authorize("SUPER_ADMIN", "ADMIN"),
  restaurantController.updateRestaurant
);
restaurantRoutes.delete(
  "/:id",
  authenticateToken,
  authorize("ADMIN"),
  restaurantController.deleteRestaurant
);
export = restaurantRoutes;
