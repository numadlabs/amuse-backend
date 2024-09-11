import express from "express";
import { notificationController } from "../controllers/notificationController";
import { authorize } from "../middlewares/authorization";
import { authenticateToken } from "../middlewares/authenticateToken";
const notificationRouter = express.Router();

notificationRouter.post(
  "/send-push-notification",
  authenticateToken(),
  authorize("SUPER_ADMIN"),
  notificationController.sendPushNotification
);

notificationRouter.get(
  "/user",
  authenticateToken(),
  authorize("USER"),
  notificationController.getByUserId
);

notificationRouter.get(
  "/employee",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER", "RESTAURANT_WAITER"),
  notificationController.getByEmployeeId
);

notificationRouter.put(
  "/employee/mark-as-read",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER", "RESTAURANT_WAITER"),
  notificationController.markAsReadByEmployeeId
);

notificationRouter.put(
  "/user/mark-as-read",
  authenticateToken(),
  authorize("USER"),
  notificationController.markAsReadByUserId
);

export = notificationRouter;
