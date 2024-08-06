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
  UserController.updateUser
);

userRoutes.delete("/", authenticateToken, UserController.deleteUser);

userRoutes.get("/cards", authenticateToken, UserController.getUserCards);
userRoutes.get("/taps", authenticateToken, UserController.getUserTaps);
userRoutes.get(
  "/locations",
  authenticateToken,
  authorize("RESTAURANT_OWNER"),
  UserController.getDistinctUserLocations
);
userRoutes.get("/:id", authenticateToken, UserController.getUserById);

export = userRoutes;
