import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { Insertable } from "kysely";
import { ProductCategory } from "@prisma/client";
import { productCategoryRepository } from "../repository/productCategoryRepository";
import {
  createProductCategorySchema,
  getProductCategoryByNameSchema,
} from "../validations/productCategorySchema";
import { get } from "http";
import { idSchema } from "../validations/sharedSchema";

export const productCategoryController = {
  create: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = createProductCategorySchema.parse(req.body);

      const productCategory = await productCategoryRepository.create({ name });

      return res.status(200).json({
        success: true,
        data: {
          productCategory: productCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productCategory = await productCategoryRepository.getAll();

      return res.status(200).json({
        success: true,
        data: {
          productCategory: productCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const productCategory = await productCategoryRepository.getById(id);

      return res.status(200).json({
        success: true,
        data: {
          productCategory: productCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getByName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = getProductCategoryByNameSchema.parse(req.params);

      const productCategory = await productCategoryRepository.getByName(name);

      return res.status(200).json({
        success: true,
        data: {
          productCategory: productCategory,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
