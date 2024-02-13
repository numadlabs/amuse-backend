import express from "express";
const userRoutes = express.Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authController } from "../controllers/authController";

userRoutes.put("/users", authenticateToken, UserController.updateUser);
userRoutes.delete("/users", authenticateToken, UserController.deleteUser);

userRoutes.get("/users/cards", authenticateToken, UserController.getUserCards);
userRoutes.get("/users/taps", authenticateToken, UserController.getUserTaps);

export = userRoutes;
