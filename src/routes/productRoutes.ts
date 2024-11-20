import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { productController } from "../controllers/productController";
import { authorize } from "../middlewares/authorization";
import { parseFile } from "../middlewares/fileParser";

const productRouter = express.Router();

productRouter.post(
  "/",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  parseFile("image"),
  productController.createProduct
);

productRouter.put(
  "/:id",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  parseFile("image"),
  productController.updateProduct
);

productRouter.delete(
  "/:id",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  productController.deleteProduct
);

productRouter.get("/:id", productController.getProductById);

productRouter.get(
  "/restaurant/:restaurantId",
  productController.getProductsByRestaurantId
);

export = productRouter;
