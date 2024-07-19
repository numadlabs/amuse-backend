import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
const authRoutes = express.Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", authController.register);
authRoutes.post("/registerOTP", authController.sendRegisterOTP);
authRoutes.post("/checkTelNumber", authController.checkTelNumber);
authRoutes.post("/checkOTP", authController.checkRegisterOTP);

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

authRoutes.post("/forgotPassword/otp", authController.sendOTP);
authRoutes.post("/forgotPassword/checkOTP", authController.checkOTP);
authRoutes.post("/forgotPassword", authController.forgotPassword);

export = authRoutes;
