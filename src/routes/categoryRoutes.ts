import express from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.get);
categoryRouter.post(
  "/",
  authenticateToken,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  categoryController.create
);

export = categoryRouter;
