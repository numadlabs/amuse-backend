import express from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authorize } from "../middlewares/authorization";
import { authenticateToken } from "../middlewares/authenticateToken";
const dashboardRoutes = express.Router();

dashboardRoutes.get(
  "/budget/:restaurantId/restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  dashboardController.getBudgetPieChart
);
dashboardRoutes.get(
  "/taps/area/:restaurantId/restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  dashboardController.getTapByAreaTable
);
dashboardRoutes.get(
  "/taps/:restaurantId/restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  dashboardController.getTapLineGraph
);
dashboardRoutes.get(
  "/totals/:restaurantId/restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  dashboardController.getTotals
);
dashboardRoutes.get(
  "/taps/:restaurantId/restaurant/checkin",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  dashboardController.getTapByFrequency
);

export = dashboardRoutes;
