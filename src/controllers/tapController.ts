import { NextFunction, Request, Response } from "express";
import { tapRepository } from "../repository/tapRepository";
import { tapServices } from "../services/tapServices";
import { AuthenticatedRequest } from "../../custom";

export const tapController = {
  generateTap: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Couldn't parse the id from the token.",
      });

    try {
      const hashedData = await tapServices.generateTap(req.user.id);

      return res.status(200).json({ success: true, data: hashedData });
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
          tap: result.tap,
          increment: result.increment,
          bonus: result.bonus,
          userTier: result.userTier,
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
  verifyTap: async (
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
      const status = await tapServices.verifyTap(encryptedData, req.user.id);

      return res.status(200).json({
        success: true,
        data: { isOwned: status.isOwned, userCardId: status.userCard?.id },
      });
    } catch (e) {
      next(e);
    }
  },
};
