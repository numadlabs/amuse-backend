"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const cardController_1 = require("../controllers/cardController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const authorization_1 = require("../middlewares/authorization");
const cardRoutes = express_1.default.Router();
cardRoutes.get("/:id", cardController_1.cardController.getCardById);
cardRoutes.get("/:restaurantId/restaurants", cardController_1.cardController.getCardsByRestaurantId);
cardRoutes.get("/", cardController_1.cardController.getCards);
cardRoutes.post("/", authenticateToken_1.authenticateToken, (0, authorization_1.authorize)("ADMIN", "SUPER_ADMIN"), cardController_1.cardController.createCard);
cardRoutes.put("/:id", authenticateToken_1.authenticateToken, (0, authorization_1.authorize)("ADMIN", "SUPER_ADMIN"), cardController_1.cardController.updateCard);
cardRoutes.delete("/:id", authenticateToken_1.authenticateToken, (0, authorization_1.authorize)("ADMIN", "SUPER_ADMIN"), cardController_1.cardController.deleteCard);
module.exports = cardRoutes;
