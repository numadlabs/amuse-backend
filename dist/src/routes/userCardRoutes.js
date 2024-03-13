"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../middlewares/authenticateToken");
const userCardController_1 = require("../controllers/userCardController");
const userCardRoutes = express_1.default.Router();
userCardRoutes.post("/buy", authenticateToken_1.authenticateToken, userCardController_1.userCardController.buyUserCard);
userCardRoutes.delete("/:id", authenticateToken_1.authenticateToken, userCardController_1.userCardController.deleteUserCard);
module.exports = userCardRoutes;
