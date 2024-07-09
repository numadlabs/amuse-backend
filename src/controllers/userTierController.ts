import { NextFunction, Request, Response } from "express";
import { userTierRepository } from "../repository/userTierRepository";

export const userTierController = {
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const tier = await userTierRepository.getById(id);

      return res.status(200).json({ success: true, data: tier });
    } catch (e) {
      next(e);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tier = await userTierRepository.get();

      return res.status(200).json({ success: true, data: tier });
    } catch (e) {
      next(e);
    }
  },
};
