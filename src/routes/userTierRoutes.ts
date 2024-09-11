import express from "express";
import { userTierController } from "../controllers/userTierController";
import { authenticateToken } from "../middlewares/authenticateToken";
const userTierRouter = express.Router();

userTierRouter.get("/", authenticateToken(), userTierController.get);
userTierRouter.get("/:id", authenticateToken(), userTierController.getById);

export = userTierRouter;
