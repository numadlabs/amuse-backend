import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { userBonusServices } from "../services/userBonusServices";
import { CustomError } from "../exceptions/CustomError";
import {
  bonusIdSchema,
  encryptedDataSchema,
  idSchema,
  restaurantIdSchema,
  userCardIdSchema,
} from "../validations/sharedSchema";

export const userBonusController = {
  buy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bonusId, restaurantId } = req.body;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const userBonus = await userBonusServices.buy(req.user.id, bonusId);

      return res.status(200).json({ success: true, data: userBonus });
    } catch (e) {
      next(e);
    }
  },
  generate: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const hashedData = await userBonusServices.generate(id, req.user?.id);

      return res
        .status(200)
        .json({ success: true, data: { encryptedData: hashedData } });
    } catch (e) {
      next(e);
    }
  },
  useUserBonus: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { encryptedData } = encryptedDataSchema.parse(req.body);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const userBonus = await userBonusServices.use(
        encryptedData,
        req.user?.id
      );

      return res.status(200).json({ success: true, data: userBonus });
    } catch (e) {
      next(e);
    }
  },
  getUnusedByUserCardId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userCardId } = userCardIdSchema.parse(req.params);

      const bonus = await userBonusServices.getByUserCardId(userCardId);

      return res.status(200).json({ success: true, data: bonus });
    } catch (e) {
      next(e);
    }
  },
  getUnusedByRestaurantId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const userBonuses = await userBonusServices.getByRestaurantId(
        restaurantId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        data: {
          userBonuses: userBonuses.userBonuses,
          followingBonus: userBonuses.followingBonus,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
