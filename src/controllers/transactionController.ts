import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { transactionRepository } from "../repository/transactionRepository";
import { transactionServices } from "../services/transactionServices";
import { AuthenticatedRequest } from "../../custom";
import { createTransactionSchema } from "../validations/transactionSchema";
import { restaurantIdSchema, userIdSchema } from "../validations/sharedSchema";
import { CustomError } from "../exceptions/CustomError";

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

      if (!req.user) throw new CustomError("Could not parse the token.", 400);

      const transactions = await transactionServices.getByRestaurantId(
        restaurantId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        data: {
          transaction: transactions,
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

      if (!req.user) throw new CustomError("Could not parse the token.", 400);

      if (req.user.id !== userId)
        throw new CustomError("You are not allowed to do this action.", 400);

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
