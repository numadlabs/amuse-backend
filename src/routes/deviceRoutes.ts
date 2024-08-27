import express from "express";
import { deviceController } from "../controllers/deviceController";
const deviceRouter = express.Router();

deviceRouter.post("/", deviceController.create);

export = deviceRouter;
