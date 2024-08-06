import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { dashboardServices } from "../services/dashboardServices";
import {
  dashboardSchema,
  restaurantIdSchema,
} from "../validations/sharedSchema";

export const dashboardController = {
  getTapLineGraph: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
      let { dayNo, location } = dashboardSchema.parse(req.query);

      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      if (!location) location = "1";

      const data = await dashboardServices.getTapByDate(
        req.user.id,
        restaurantId,
        dayNo,
        location
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
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
      let { dayNo } = dashboardSchema.parse(req.query);
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

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
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
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
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
      let { dayNo } = dashboardSchema.parse(req.query);
      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

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
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);
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
