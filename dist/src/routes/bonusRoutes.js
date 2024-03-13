"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../middlewares/authenticateToken");
const bonusController_1 = require("../controllers/bonusController");
const bonusRoutes = express_1.default.Router();
bonusRoutes.post("/", authenticateToken_1.authenticateToken, bonusController_1.bonusController.createBonus);
bonusRoutes.put("/:id", authenticateToken_1.authenticateToken, bonusController_1.bonusController.updateBonus);
bonusRoutes.delete("/:id", authenticateToken_1.authenticateToken, bonusController_1.bonusController.deleteBonus);
module.exports = bonusRoutes;
