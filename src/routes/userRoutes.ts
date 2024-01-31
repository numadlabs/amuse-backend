import express from "express";
const userRoutes = express.Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";

userRoutes.post("/auth/login", UserController.login);
userRoutes.post("/auth/register", UserController.register);
//rate limit it 1 per 30sec
userRoutes.post("/auth/otp", UserController.sendOTP);
userRoutes.post("/auth/verifyOTP/:id", UserController.verifyOTP);
userRoutes.post(
  "/auth/email",
  authenticateToken,
  UserController.sendVerificationEmail
);
userRoutes.post(
  "/auth/verifyEmail",
  authenticateToken,
  UserController.verifyEmailVerification
);

export = userRoutes;
