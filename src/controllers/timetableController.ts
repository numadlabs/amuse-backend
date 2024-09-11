import { NextFunction, Request, Response } from "express";
import { timetableRepository } from "../repository/timetableRepository";
import { Timetable } from "../types/db/types";
import { Updateable } from "kysely";
import { timetableServices } from "../services/timetableServices";
import { idSchema, restaurantIdSchema } from "../validations/sharedSchema";
import { updateTimetableSchema } from "../validations/timetableSchema";

export const timetableController = {
  getByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

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
    try {
      const data: Updateable<Timetable> = updateTimetableSchema.parse(req.body);
      const { id } = idSchema.parse(req.params);

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
