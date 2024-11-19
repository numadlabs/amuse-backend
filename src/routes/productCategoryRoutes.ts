import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { productCategoryController } from "../controllers/productCategoryController";
import { authorize } from "../middlewares/authorization";
import { parseFile } from "../middlewares/fileParser";

const productCategoryRouter = express.Router();

productCategoryRouter.post(
  "/",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  productCategoryController.create
);

productCategoryRouter.get("/", productCategoryController.get);

productCategoryRouter.get("/:id", productCategoryController.getById);

productCategoryRouter.post("/name/:name", productCategoryController.getByName);

export = productCategoryRouter;
