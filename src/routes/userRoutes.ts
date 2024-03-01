import express from "express";
const userRoutes = express.Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";

userRoutes.put("/", authenticateToken, UserController.updateUser);
userRoutes.delete("/", authenticateToken, UserController.deleteUser);

userRoutes.get("/cards", authenticateToken, UserController.getUserCards);
userRoutes.get("/taps", authenticateToken, UserController.getUserTaps);

userRoutes.get("/:id", authenticateToken, UserController.getUserById);

export = userRoutes;
