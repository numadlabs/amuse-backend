import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { timetableController } from "../controllers/timetableController";
const timetableRouter = express.Router();

timetableRouter.get(
  "/:restaurantId/restaurant",
  authenticateToken(),
  timetableController.getByRestaurantId
);
timetableRouter.put("/:id", authenticateToken(), timetableController.update);

export = timetableRouter;
