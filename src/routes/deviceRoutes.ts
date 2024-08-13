import express from "express";
import { deviceController } from "../controllers/deviceController";
import { authenticateToken } from "../middlewares/authenticateToken";
const deviceRouter = express.Router();

deviceRouter.post("/", authenticateToken, deviceController.create);

export = deviceRouter;
