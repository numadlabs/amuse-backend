import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import {
  createProductSchema,
  productPaginationSchema,
  updateProductSchema,
} from "../validations/productSchema";
import { Insertable, Updateable } from "kysely";
import { Product } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { productServices } from "../services/productServices";
import { idSchema, restaurantIdSchema } from "../validations/sharedSchema";
import { db } from "../utils/db";
import { productRepository } from "../repository/productRepository";

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
  getProductsByRestaurantIdFiltered: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputQuery = productPaginationSchema.parse(req.query);

      const page = inputQuery.page || 1;
      const pageSize = inputQuery.limit || 10;
      const categoryId = inputQuery.productCategoryId;
      const offset = (page - 1) * pageSize;

      let query = db
        .selectFrom("Product")
        .innerJoin(
          "ProductCategory",
          "Product.productCategoryId",
          "ProductCategory.id"
        )
        .select([
          "Product.id",
          "Product.name",
          "Product.price",
          "Product.imageUrl",
          "Product.createdAt",
          "Product.status",
          "Product.restaurantId",
          "ProductCategory.id as productCategoryId",
          "ProductCategory.name as productCategory",
        ])
        .where("Product.restaurantId", "=", inputQuery.restaurantId)
        .where("Product.productCategoryId", "=", categoryId)
        .orderBy("Product.createdAt", "desc")
        .limit(pageSize)
        .offset(offset);

      const [products, totalProducts] = await Promise.all([
        query.execute(),
        productRepository.count(),
      ]);

      const totalPages = Math.ceil(totalProducts.count / pageSize);

      return res.status(200).json({
        success: true,
        data: {
          products: products,
          totalPages: totalPages,
          currentPage: page,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
