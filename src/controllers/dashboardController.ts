import { NextFunction, Request, Response } from "express";
import { dashboardRepository } from "../repository/dashboardRepository";

export const dashboardController = {
  getTapLineGraph: async (req: Request, res: Response, next: NextFunction) => {
    const { restaurantId } = req.params;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    currentDate.setHours(0, 0, 0, 0);
    console.log(currentDate);

    let newMonth = currentMonth - 3;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth += 12;
      newYear -= 1;
    }

    const startDate = new Date(newYear, newMonth + 1, 0);
    startDate.setHours(0, 0, 0, 0);

    try {
      const data = await dashboardRepository.getTapByDate(
        restaurantId,
        startDate,
        currentDate
      );

      return res.status(200).json({ success: true, data: data });
    } catch (e) {
      next(e);
    }
  },
  getTapByAreaTable: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      const data = await dashboardRepository.getTapByArea(restaurantId);

      return res.status(200).json({ success: true, data: data });
    } catch (e) {
      next(e);
    }
  },
};
