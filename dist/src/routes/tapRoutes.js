"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const tapController_1 = require("../controllers/tapController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const tapRouter = express_1.default.Router();
tapRouter.post("/generate", authenticateToken_1.authenticateToken, tapController_1.tapController.generateTap);
tapRouter.post("/redeem", authenticateToken_1.authenticateToken, tapController_1.tapController.redeemTap);
tapRouter.get("/:id", tapController_1.tapController.getTapById);
module.exports = tapRouter;
