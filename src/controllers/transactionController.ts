import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { transactionRepository } from "../repository/transactionRepository";
import { transactionServices } from "../services/transactionServices";
import { AuthenticatedRequest } from "../../custom";
import { createTransactionSchema } from "../validations/transactionSchema";
import { restaurantIdSchema, userIdSchema } from "../validations/sharedSchema";

export const transactionController = {
  deposit: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: Insertable<Transaction> = createTransactionSchema.parse(
        req.body
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
  withdraw: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: Insertable<Transaction> = createTransactionSchema.parse(
        req.body
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

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
  getByUserId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = userIdSchema.parse(req.params);

      const transaction = await transactionRepository.getByUserId(userId);

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
