import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const authRoutes = express.Router();

authRoutes.post("/auth/login", authController.login);
authRoutes.post("/auth/register", authController.register);
//rate limit it 1 per 30sec
authRoutes.post("/auth/otp", authController.sendOTP);
authRoutes.post("/auth/verifyOTP/:id", authController.verifyOTP);
authRoutes.post(
  "/auth/email",
  authenticateToken,
  authController.sendVerificationEmail
);
authRoutes.post(
  "/auth/verifyEmail",
  authenticateToken,
  authController.verifyEmailVerification
);
authRoutes.post("/auth/refreshToken", authController.refreshToken);
authRoutes.post("/auth/:id/checkOTP", authController.checkOTP);
authRoutes.post("/auth/:id/changePassword", authController.changePassword);

/* authRoutes.post(
  "/auth/authorization",
  authenticateToken,
  authorize("USER", "ADMIN"),
  authController.testAuthorization
); */

export = authRoutes;
