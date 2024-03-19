import { NextFunction, Request, Response } from "express";
import { tapRepository } from "../repository/tapRepository";
import { tapServices } from "../services/tapServices";
import { AuthenticatedRequest } from "../../custom";

export const tapController = {
  //z
  generateTap: async (req: Request, res: Response, next: NextFunction) => {
    const { restaurantId } = req.body;

    if (!restaurantId)
      return res.status(400).json({
        success: false,
        data: null,
        error: "No restaurantId was found.",
      });

    try {
      const hashedData = await tapServices.generateTap(restaurantId);

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
      const tap = await tapServices.redeemTap(encryptedData, req.user.id);

      return res.status(200).json({ success: true, data: { tap: tap } });
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
