"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userRoutes = express_1.default.Router();
const userController_1 = require("../controllers/userController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const fileParser_1 = require("../middlewares/fileParser");
userRoutes.put("/:id", authenticateToken_1.authenticateToken, (0, fileParser_1.parseFile)("profilePicture"), userController_1.UserController.updateUser);
userRoutes.delete("/", authenticateToken_1.authenticateToken, userController_1.UserController.deleteUser);
userRoutes.get("/cards", authenticateToken_1.authenticateToken, userController_1.UserController.getUserCards);
userRoutes.get("/taps", authenticateToken_1.authenticateToken, userController_1.UserController.getUserTaps);
userRoutes.get("/:id", authenticateToken_1.authenticateToken, userController_1.UserController.getUserById);
module.exports = userRoutes;
