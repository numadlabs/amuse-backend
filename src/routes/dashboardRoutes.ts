import express from "express";
import { dashboardController } from "../controllers/dashboardController";
const dashboardRoutes = express.Router();

dashboardRoutes.get(
  "/taps/area/:restaurantId/restaurant",
  dashboardController.getTapByAreaTable
);
dashboardRoutes.get(
  "/taps/:restaurantId/restaurant",
  dashboardController.getTapLineGraph
);
dashboardRoutes.get(
  "/taps/:restaurantId/restaurant/checkin",
  dashboardController.getTapByCheckIn
);

export = dashboardRoutes;
