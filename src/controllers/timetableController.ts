import { NextFunction, Request, Response } from "express";
import { timetableRepository } from "../repository/timetableRepository";
import { Timetable } from "../types/db/types";
import { Updateable } from "kysely";
import { timetableServices } from "../services/timetableServices";
import { idSchema, restaurantIdSchema } from "../validations/sharedSchema";
import { updateTimetableSchema } from "../validations/timetableSchema";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";

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
  update: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: Updateable<Timetable> = updateTimetableSchema.parse(req.body);
      const { id } = idSchema.parse(req.params);
      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);

      const timetable = await timetableServices.update(data, id, req.user.id);

      return res.status(200).json({
        success: true,
        data: timetable,
      });
    } catch (e) {
      next(e);
    }
  },
};
