import express from "express";
import { deviceController } from "../controllers/deviceController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const deviceRouter = express.Router();

deviceRouter.post(
  "/",
  authenticateToken(),
  authorize("USER"),
  deviceController.create
);

export = deviceRouter;
