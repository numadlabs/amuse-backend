import express from "express";
import { userTierController } from "../controllers/userTierController";
const userTierRouter = express.Router();

userTierRouter.get("/", userTierController.get);
userTierRouter.get("/:id", userTierController.getById);

export = userTierRouter;
