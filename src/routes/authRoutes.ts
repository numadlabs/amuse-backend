import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import {
  authRateLimiter,
  checkOtpRateLimiter,
  forgotPasswordOtpRateLimiter,
  registerOtpRateLimiter,
  sendOtpRateLimiter,
} from "../middlewares/rateLimiter";
const authRoutes = express.Router();

authRoutes.post("/login", authRateLimiter, authController.login);
authRoutes.post("/sendOTP", sendOtpRateLimiter, authController.sendOTP);
authRoutes.post("/checkOTP", checkOtpRateLimiter, authController.checkOTP);
authRoutes.post("/checkEmail", authController.checkEmail);
authRoutes.post("/register", registerOtpRateLimiter, authController.register);
authRoutes.post("/refresh-token", authController.verifyRefreshToken);
authRoutes.post("/access-token", authController.verifyAccessToken);
authRoutes.put(
  "/forgotPassword",
  forgotPasswordOtpRateLimiter,
  authController.forgotPassword
);
authRoutes.put(
  "/changePassword",
  authenticateToken(),
  authorize("USER"),
  authController.changePassword
);

authRoutes.post("/google", authController.signInByGoogle);

export = authRoutes;
