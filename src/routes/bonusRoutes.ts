import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { bonusController } from "../controllers/bonusController";
const bonusRoutes = express.Router();

bonusRoutes.post("/", authenticateToken, bonusController.createBonus);
bonusRoutes.put("/:id", authenticateToken, bonusController.updateBonus);
bonusRoutes.delete("/:id", authenticateToken, bonusController.deleteBonus);

export = bonusRoutes;
