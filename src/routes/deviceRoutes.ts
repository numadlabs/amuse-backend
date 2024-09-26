import express from "express";
import { deviceController } from "../controllers/deviceController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const deviceRouter = express.Router();

deviceRouter.post("/", deviceController.create);
deviceRouter.put(
  "/:userId/user",
  authenticateToken(),
  authorize("USER"),
  deviceController.update
);

export = deviceRouter;
