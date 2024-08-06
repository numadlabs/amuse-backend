import { NextFunction, Request, Response } from "express";
import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { bonusRepository } from "../repository/bonusRepository";
import { bonusServices } from "../services/bonusServices";
import { BONUS_TYPE } from "../types/db/enums";
import {
  createBonusSchema,
  updateBonusSchema,
} from "../validations/bonusSchema";
import {
  bonusTypeSchema,
  idSchema,
  restaurantIdSchema,
} from "../validations/sharedSchema";

export const bonusController = {
  createBonus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: Insertable<Bonus> = createBonusSchema.parse(req.body);

      const createdBonus = await bonusServices.create(data);

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
    try {
      const data: Updateable<Bonus> = updateBonusSchema.parse(req.body);
      const { id } = idSchema.parse(req.params);

      const bonus = await bonusServices.update(data, id);

      return res.status(200).json({ success: true, data: { bonus: bonus } });
    } catch (e) {
      next(e);
    }
  },
  deleteBonus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

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
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
      const { type } = bonusTypeSchema.parse(req.query);

      const bonuses = await bonusRepository.getByRestaurantId(
        restaurantId,
        type as BONUS_TYPE
      );

      return res.status(200).json({ success: true, data: bonuses });
    } catch (e) {
      next(e);
    }
  },
};
