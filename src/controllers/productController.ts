import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/productSchema";
import { Insertable, Updateable } from "kysely";
import { Product } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { productServices } from "../services/productServices";
import { idSchema, restaurantIdSchema } from "../validations/sharedSchema";

export const productController = {
  createProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = createProductSchema.parse(req.body);
      const data: Insertable<Product> = { ...req.body };
      const file = req.file as Express.Multer.File;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const product = await productServices.create(data, file, req.user.id);

      return res
        .status(200)
        .json({ success: true, data: { product: product } });
    } catch (e) {
      next(e);
    }
  },
  updateProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      req.body = updateProductSchema.parse(req.body);
      const data: Updateable<Product> = { ...req.body };
      const file = req.file as Express.Multer.File;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const product = await productServices.update(id, data, file, req.user.id);

      return res
        .status(200)
        .json({ success: true, data: { product: product } });
    } catch (e) {
      next(e);
    }
  },
  deleteProduct: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const deletedProduct = await productServices.delete(id, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          product: deletedProduct,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getProductById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const product = await productServices.getById(id);

      return res.status(200).json({
        success: true,
        data: {
          product: product,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getProductsByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

      const products = await productServices.getByRestaurantId(restaurantId);

      return res.status(200).json({
        success: true,
        data: {
          products: products,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
