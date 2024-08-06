import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userCardController } from "../controllers/userCardController";
const userCardRoutes = express.Router();

userCardRoutes.post(
  "/:cardId/buy",
  authenticateToken,
  userCardController.buyUserCard
);
userCardRoutes.delete(
  "/:id",
  authenticateToken,
  userCardController.deleteUserCard
);

export = userCardRoutes;
