import express from "express";
import { notificationController } from "../controllers/notificationController";
const notificationRouter = express.Router();

notificationRouter.post("/send", notificationController.send);

export = notificationRouter;
