import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
const authRoutes = express.Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", authController.register);
authRoutes.post("/otp", authController.sendOTP);
authRoutes.post("/verifyOTP/:id", authController.verifyOTP);
authRoutes.post(
  "/email",
  authenticateToken,
  authController.sendVerificationEmail
);
authRoutes.post(
  "/verifyEmail",
  authenticateToken,
  authController.verifyEmailVerification
);
authRoutes.post("/refreshToken", authController.refreshToken);
authRoutes.post("/:id/checkOTP", authController.checkOTP);
authRoutes.post("/:id/changePassword", authController.changePassword);

export = authRoutes;
