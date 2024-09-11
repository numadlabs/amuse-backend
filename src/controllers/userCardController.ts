import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { userCardServices } from "../services/userCardServices";
import { CustomError } from "../exceptions/CustomError";
import { cardIdSchema, idSchema } from "../validations/sharedSchema";

export const userCardController = {
  buyUserCard: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cardId } = cardIdSchema.parse(req.params);

      if (!req.user) throw new CustomError("Could not parse the token.", 400);

      const userCard = await userCardServices.buy(req.user.id, cardId);

      return res.status(200).json({
        success: true,
        data: {
          userCard: userCard,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  deleteUserCard: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      const deletedUserCard = await userCardServices.delete(id);

      return res
        .status(200)
        .json({ success: true, data: { userCard: deletedUserCard } });
    } catch (e) {
      next(e);
    }
  },
};
