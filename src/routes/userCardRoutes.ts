import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { userCardController } from "../controllers/userCardController";
import { authorize } from "../middlewares/authorization";
import blockSimultaneousRequests from "../middlewares/blockSimultaneousRequests";
const userCardRoutes = express.Router();

userCardRoutes.post(
  "/:cardId/buy",
  authenticateToken(),
  authorize("USER"),
  blockSimultaneousRequests,
  userCardController.buyUserCard
);
// userCardRoutes.delete(
//   "/:id",
//   authenticateToken(),
//   userCardController.deleteUserCard
// );

export = userCardRoutes;
