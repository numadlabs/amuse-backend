import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { transactionRepository } from "../repository/transactionRepository";
import { transactionServices } from "../services/transactionServices";

export const transactionController = {
  deposit: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Transaction> = { ...req.body };

    try {
      if (data.restaurantId && data.userId)
        throw new CustomError(
          "Cannot provide both restaurantId and userId",
          400
        );

      const transaction = await transactionServices.deposit(data);

      return res.status(200).json({
        success: true,
        data: {
          transaction: transaction,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  withdraw: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Transaction> = { ...req.body };

    try {
      if (data.restaurantId && data.userId)
        throw new CustomError(
          "Cannot provide both restaurantId and userId",
          400
        );

      const transaction = await transactionServices.withdraw(data);

      return res.status(200).json({
        success: true,
        data: {
          transaction: transaction,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      const transaction = await transactionRepository.getByRestaurantId(
        restaurantId
      );

      return res.status(200).json({
        success: true,
        data: {
          transaction: transaction,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
