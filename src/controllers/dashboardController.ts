import { NextFunction, Request, Response } from "express";
import { dashboardRepository } from "../repository/dashboardRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { dashboardServices } from "../services/dashboardServices";

export const dashboardController = {
  getTapLineGraph: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    const dayNo = Number(req.query.dayNo);

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );
      if (!dayNo) throw new CustomError("Please provide the dayNo.", 400);

      const data = await dashboardServices.getTapByDate(
        req.user.id,
        restaurantId,
        dayNo
      );

      return res.status(200).json({ success: true, data: data });
    } catch (e) {
      next(e);
    }
  },
  getTapByAreaTable: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    const dayNo = Number(req.query.dayNo);

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );
      if (!dayNo) throw new CustomError("Please provide the dayNo.", 400);

      const data = await dashboardServices.getTapByArea(
        req.user.id,
        restaurantId,
        dayNo
      );

      return res.status(200).json({ success: true, data: data });
    } catch (e) {
      next(e);
    }
  },
  getBudgetPieChart: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const result = await dashboardServices.getBudgetPieChart(
        req.user.id,
        restaurantId
      );

      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
  getTapByFrequency: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    const dayNo = Number(req.query.dayNo);

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );
      if (!dayNo) throw new CustomError("Please provide the dayNo.", 400);

      const data = await dashboardServices.getTapByFrequency(
        req.user.id,
        restaurantId,
        dayNo
      );

      return res.status(200).json({ success: true, data: data });
    } catch (e) {
      next(e);
    }
  },
  getTotals: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const result = await dashboardServices.getTotals(
        req.user?.id,
        restaurantId
      );

      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
};
