import express from "express";
import { cardController } from "../controllers/cardController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import { parseFile } from "../middlewares/fileParser";
const cardRoutes = express.Router();

cardRoutes.get("/:id", authenticateToken(), cardController.getCardById);
cardRoutes.get(
  "/:restaurantId/restaurants",
  authenticateToken(),
  cardController.getCardsByRestaurantId
);
// cardRoutes.get("/", cardController.getCards);

cardRoutes.post(
  "/",
  authenticateToken(),
  authorize("RESTAURANT_OWNER"),
  parseFile("nftImage"),
  cardController.createCard
);
cardRoutes.put(
  "/:id",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  parseFile("nftImage"),
  cardController.updateCard
);
// cardRoutes.delete(
//   "/:id",
//   authenticateToken(),
//   authorize("SUPER_ADMIN"),
//   cardController.deleteCard
// );

export = cardRoutes;
