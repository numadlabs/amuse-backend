import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import { blacklistController } from "../controllers/blacklistController";
const blacklistRouter = express.Router();

blacklistRouter
  .post(
    "/",
    authenticateToken(),
    authorize("SUPER_ADMIN"),
    blacklistController.add
  )
  .delete(
    "/",
    authenticateToken(),
    authorize("SUPER_ADMIN"),
    blacklistController.remove
  );

export = blacklistRouter;
