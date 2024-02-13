import express from "express";
import { cardController } from "../controllers/cardController";
const cardRoutes = express.Router();

cardRoutes.get("/cards/:id", cardController.getCardById);
cardRoutes.get(
  "/cards/:restaurantId/restaurants",
  cardController.getCardsByRestaurantId
);
cardRoutes.get("/cards", cardController.getCards);

cardRoutes.post("/cards", cardController.createCard);
cardRoutes.put("/cards/:id", cardController.updateCard);
cardRoutes.delete("/cards/:id", cardController.deleteCard);

export = cardRoutes;
