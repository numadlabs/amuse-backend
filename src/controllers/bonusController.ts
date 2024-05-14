import { NextFunction, Request, Response } from "express";
import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { bonusRepository } from "../repository/bonusRepository";

export const bonusController = {
  createBonus: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Bonus> = { ...req.body };
    if (!data.cardId || !data.imageUrl || !data.name || data.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request." });

    try {
      //different creating options such as creating UserBonus for every user, or with conditions
      const createdBonus = await bonusRepository.create(data);

      return res.status(200).json({
        success: true,
        data: {
          bonus: createdBonus,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  updateBonus: async (req: Request, res: Response, next: NextFunction) => {
    const data: Updateable<Bonus> = { ...req.body };
    const { id } = req.params;

    if (data.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Cannot update id field." });

    try {
      const updatedBonus = await bonusRepository.update(data, id);

      return res
        .status(200)
        .json({ success: true, data: { bonus: updatedBonus } });
    } catch (e) {
      next(e);
    }
  },
  deleteBonus: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const deletedBonus = await bonusRepository.delete(id);

      return res
        .status(200)
        .json({ success: true, data: { bonus: deletedBonus } });
    } catch (e) {
      next(e);
    }
  },
  getByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      const bonuses = await bonusRepository.getByRestaurantId(restaurantId);

      return res.status(200).json({ success: true, data: bonuses });
    } catch (e) {
      next(e);
    }
  },
};
