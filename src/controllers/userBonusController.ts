import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { userBonusServices } from "../services/userBonusServices";
import { userBonusRepository } from "../repository/userBonusRepository";

export const userBonusController = {
  useUserBonus: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    if (!req.user?.id) return res.status(401).json("Invalid access token.");

    try {
      const encryptedString = await userBonusServices.use(id, req.user?.id);

      return res.status(200).json({ success: true, data: encryptedString });
    } catch (e) {
      next(e);
    }
  },
  redeemUserBonus: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { encryptedData } = req.body;

    if (!encryptedData)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Passed no data ." });

    try {
      const userBonus = await userBonusServices.redeem(encryptedData);

      return res.status(200).json({ success: true, data: userBonus });
    } catch (e) {
      next(e);
    }
  },
  getByUserCardId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { userCardId } = req.body;

    if (!userCardId)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Please provide a userCard.",
      });

    try {
      const bonus = await userBonusRepository.getByUserCardId(userCardId);

      return res.status(200).json({ success: true, data: bonus });
    } catch (e) {
      next(e);
    }
  },
};
