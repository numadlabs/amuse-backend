import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authenticateToken";
const authRoutes = express.Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/sendOTP", authController.sendOTP);
authRoutes.post("/checkOTP", authController.checkOTP);
authRoutes.post("/checkEmail", authController.checkEmail);
authRoutes.post("/register", authController.register);
authRoutes.post("/refreshToken", authController.refreshToken);
authRoutes.put("/forgotPassword", authController.forgotPassword);
authRoutes.put(
  "/changePassword",
  authenticateToken,
  authController.changePassword
);

export = authRoutes;
