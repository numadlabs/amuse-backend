import express from "express";
import { cardController } from "../controllers/cardController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const cardRoutes = express.Router();

cardRoutes.get("/cards/:id", cardController.getCardById);
cardRoutes.get(
  "/cards/:restaurantId/restaurants",
  cardController.getCardsByRestaurantId
);
cardRoutes.get("/cards", cardController.getCards);

cardRoutes.post(
  "/cards",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.createCard
);
cardRoutes.put(
  "/cards/:id",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.updateCard
);
cardRoutes.delete(
  "/cards/:id",
  authenticateToken,
  authorize("ADMIN", "SUPER_ADMIN"),
  cardController.deleteCard
);

export = cardRoutes;
