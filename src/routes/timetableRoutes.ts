import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { timetableController } from "../controllers/timetableController";
import { authorize } from "../middlewares/authorization";
const timetableRouter = express.Router();

timetableRouter.get(
  "/:restaurantId/restaurant",
  authenticateToken(),
  timetableController.getByRestaurantId
);
timetableRouter.put(
  "/:id",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  timetableController.update
);

export = timetableRouter;
