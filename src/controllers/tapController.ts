import { NextFunction, Request, Response } from "express";
import { tapRepository } from "../repository/tapRepository";
import { tapServices } from "../services/tapServices";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";

export const tapController = {
  generate: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user?.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "No data passed." });

    try {
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
    const { encryptedData } = req.body;

    if (!encryptedData || !req.user?.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "No data passed." });

    try {
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
    const { id } = req.params;

    try {
      const tap = await tapRepository.getTapById(id);

      return tap;
    } catch (e) {
      next(e);
    }
  },
};
