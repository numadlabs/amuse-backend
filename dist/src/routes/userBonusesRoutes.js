"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../middlewares/authenticateToken");
const userBonusController_1 = require("../controllers/userBonusController");
const userBonusesRoutes = express_1.default.Router();
userBonusesRoutes.post("/:id/use", authenticateToken_1.authenticateToken, userBonusController_1.userBonusController.useUserBonus);
userBonusesRoutes.post("/redeem", authenticateToken_1.authenticateToken, userBonusController_1.userBonusController.redeemUserBonus);
module.exports = userBonusesRoutes;
