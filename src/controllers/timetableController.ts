import { NextFunction, Request, Response } from "express";
import { timetableRepository } from "../repository/timetableRepository";
import { Timetable } from "../types/db/types";
import { Insertable, Updateable } from "kysely";
import { CustomError } from "../exceptions/CustomError";
import { timetableServices } from "../services/timetableServices";

export const timetableController = {
  getByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    try {
      const timetable = await timetableRepository.getByRestaurantId(
        restaurantId
      );

      return res.status(200).json({
        success: true,
        data: timetable,
      });
    } catch (e) {
      next(e);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    const data: Updateable<Timetable> = { ...req.body };
    const { id } = req.params;

    try {
      if (data.id || data.restaurantId)
        throw new CustomError(
          "You are not allowed to update this fields.",
          400
        );

      const timetable = await timetableServices.update(data, id);

      return res.status(200).json({
        success: true,
        data: timetable,
      });
    } catch (e) {
      next(e);
    }
  },
};
