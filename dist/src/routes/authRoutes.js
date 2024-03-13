"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const authRoutes = express_1.default.Router();
authRoutes.post("/login", authController_1.authController.login);
authRoutes.post("/register", authController_1.authController.register);
//rate limit it 1 per 30sec
authRoutes.post("/otp", authController_1.authController.sendOTP);
authRoutes.post("/verifyOTP/:id", authController_1.authController.verifyOTP);
authRoutes.post("/email", authenticateToken_1.authenticateToken, authController_1.authController.sendVerificationEmail);
authRoutes.post("/verifyEmail", authenticateToken_1.authenticateToken, authController_1.authController.verifyEmailVerification);
authRoutes.post("/refreshToken", authController_1.authController.refreshToken);
authRoutes.post("/:id/checkOTP", authController_1.authController.checkOTP);
authRoutes.post("/:id/changePassword", authController_1.authController.changePassword);
module.exports = authRoutes;
