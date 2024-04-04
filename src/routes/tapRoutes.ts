import express from "express";
import { tapController } from "../controllers/tapController";
import { authenticateToken } from "../middlewares/authenticateToken";
const tapRouter = express.Router();

tapRouter.post("/generate", authenticateToken, tapController.generateTap);
tapRouter.post("/redeem", authenticateToken, tapController.redeemTap);
tapRouter.post("/verify", authenticateToken, tapController.verifyTap);
tapRouter.get("/:id", tapController.getTapById);

export = tapRouter;
