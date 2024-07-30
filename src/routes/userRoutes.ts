import express from "express";
const userRoutes = express.Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { parseFile } from "../middlewares/fileParser";

userRoutes.put("/updateEmail", authenticateToken, UserController.updateEmail);
userRoutes.put(
  "/:id",
  authenticateToken,
  parseFile("profilePicture"),
  UserController.updateUser
);

userRoutes.delete("/", authenticateToken, UserController.deleteUser);

userRoutes.get("/cards", authenticateToken, UserController.getUserCards);
userRoutes.get("/taps", authenticateToken, UserController.getUserTaps);

userRoutes.get("/:id", authenticateToken, UserController.getUserById);

export = userRoutes;
