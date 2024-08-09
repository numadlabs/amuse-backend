import express from "express";
const userRoutes = express.Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { parseFile } from "../middlewares/fileParser";
import { authorize } from "../middlewares/authorization";

userRoutes.put("/updateEmail", authenticateToken, UserController.updateEmail);
userRoutes.put(
  "/:id",
  authenticateToken,
  parseFile("profilePicture"),
  UserController.updateInfo
);

userRoutes.delete(
  "/",
  authenticateToken,
  authorize("USER"),
  UserController.deleteUser
);

userRoutes.get("/cards", authenticateToken, UserController.getUserCards);
userRoutes.get("/taps", authenticateToken, UserController.getUserTaps);
userRoutes.get(
  "/locations",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  UserController.getDistinctUserLocations
);
userRoutes.get(
  "/collected-data",
  authenticateToken,
  authorize("USER"),
  UserController.fetchCollectedData
);
userRoutes.get("/:id", authenticateToken, UserController.getUserById);

export = userRoutes;
