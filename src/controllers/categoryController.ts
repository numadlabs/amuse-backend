import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Category } from "../types/db/types";
import { categoryRepository } from "../repository/categoryRepository";

export const categoryController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Category> = { ...req.body };
    if (data.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request." });

    try {
      const category = await categoryRepository.create(data);

      return res.status(200).json({
        success: true,
        data: {
          createdCategory: category,
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
