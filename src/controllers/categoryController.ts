import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Category } from "../types/db/types";
import { categoryRepository } from "../repository/categoryRepository";
import { categorySchema } from "../validations/categorySchema";

export const categoryController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: Insertable<Category> = categorySchema.parse(req.body);

      const category = await categoryRepository.create(data);

      return res.status(200).json({
        success: true,
        data: {
          category: category,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryRepository.get();

      return res.status(200).json({
        success: true,
        data: {
          category: category,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
