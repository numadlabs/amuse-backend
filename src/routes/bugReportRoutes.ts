import express from "express";
import { bugReportController } from "../controllers/bugReportControllers";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const bugReportRouter = express.Router();

bugReportRouter.post(
  "/",
  authenticateToken(),
  authorize("USER"),
  bugReportController.create
);

export = bugReportRouter;
