import express from "express";
import { notificationController } from "../controllers/notificationController";
import { authorize } from "../middlewares/authorization";
import { authenticateToken } from "../middlewares/authenticateToken";
const notificationRouter = express.Router();

notificationRouter.post(
  "/send",
  authenticateToken,
  authorize("SUPER_ADMIN"),
  notificationController.send
);

export = notificationRouter;
