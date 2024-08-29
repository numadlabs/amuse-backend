import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import {
  authRateLimiter,
  checkOtpRateLimiter,
  sendOtpRateLimiter,
} from "../middlewares/rateLimiter";
const authRoutes = express.Router();

authRoutes.post("/login", authRateLimiter, authController.login);
authRoutes.post("/sendOTP", sendOtpRateLimiter, authController.sendOTP);
authRoutes.post("/checkOTP", checkOtpRateLimiter, authController.checkOTP);
authRoutes.post("/checkEmail", authController.checkEmail);
authRoutes.post("/register", checkOtpRateLimiter, authController.register);
authRoutes.post("/refreshToken", authController.refreshToken);
authRoutes.put(
  "/forgotPassword",
  checkOtpRateLimiter,
  authController.forgotPassword
);
authRoutes.put(
  "/changePassword",
  authenticateToken(),
  authorize("USER"),
  authController.changePassword
);

export = authRoutes;
