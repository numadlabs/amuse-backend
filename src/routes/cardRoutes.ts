import express from "express";
import { cardController } from "../controllers/cardController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const cardRoutes = express.Router();

cardRoutes.get("/:id", cardController.getCardById);
cardRoutes.get(
  "/:restaurantId/restaurants",
  cardController.getCardsByRestaurantId
);
cardRoutes.get("/", cardController.getCards);

cardRoutes.post(
  "/",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.createCard
);
cardRoutes.put(
  "/:id",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.updateCard
);
cardRoutes.delete(
  "/:id",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.deleteCard
);

export = cardRoutes;
