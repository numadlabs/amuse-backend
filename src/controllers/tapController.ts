import { NextFunction, Request, Response } from "express";
import { tapRepository } from "../repository/tapRepository";
import { tapServices } from "../services/tapServices";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { encryptedDataSchema, idSchema } from "../validations/sharedSchema";

export const tapController = {
  generate: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);

      const encryptData = await tapServices.generate(req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          encryptedData: encryptData,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  redeemTap: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { encryptedData } = encryptedDataSchema.parse(req.body);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);

      const result = await tapServices.redeemTap(encryptedData, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          increment: result.increment,
          ticker: result.ticker,
          bonus: result.bonus,
          userTier: result.userTier,
          hasRecurringBonusCheck: result.bonusCheck,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getTapById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const tap = await tapRepository.getTapById(id);

      return tap;
    } catch (e) {
      next(e);
    }
  },
};
