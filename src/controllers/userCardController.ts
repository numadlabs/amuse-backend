import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { Insertable } from "kysely";
import { userCardServices } from "../services/userCardServices";
import { UserCard } from "../types/db/types";

export const userCardController = {
  buyUserCard: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const data: Insertable<UserCard> = { ...req.body };

    if (req.user?.id !== data.userId)
      return res.status(400).json("Different authenticatedUser and userId.");

    try {
      const userCard = await userCardServices.buy(data);

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
    const { id } = req.params;

    try {
      const deletedUserCard = await userCardServices.delete(id);

      return res
        .status(200)
        .json({ success: true, data: { userCard: deletedUserCard } });
    } catch (e) {
      next(e);
    }
  },
};
