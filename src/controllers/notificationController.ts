import { NextFunction, Request, Response } from "express";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";
import { notificationServices } from "../services/notificationServices";
import { notificationSchema } from "../validations/notificationSchema";
import { AuthenticatedRequest } from "../../custom";
import { employeeIdSchema, userIdSchema } from "../validations/sharedSchema";
import { notificationRepository } from "../repository/notificationRepository";

export const notificationController = {
  sendPushNotification: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { message } = notificationSchema.parse(req.body);

      const devices = await deviceRepository.get();
      if (devices.length === 0) throw new CustomError("No devices found.", 400);

      const tickets = await notificationServices.send(devices, message);

      return res.status(200).json({ success: true, data: tickets });
    } catch (e) {
      next(e);
    }
  },
  getByUserId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new CustomError("User not found.", 400);

      const notifications = await notificationRepository.getUnreadByUserId(
        req.user.id
      );

      return res.status(200).json({ success: true, data: notifications });
    } catch (e) {
      next(e);
    }
  },
  getByEmployeeId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new CustomError("User not found.", 400);

      const notifications = await notificationRepository.getUnreadByEmployeeId(
        req.user.id
      );

      return res.status(200).json({ success: true, data: notifications });
    } catch (e) {
      next(e);
    }
  },
  markAsReadByUserId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new CustomError("User not found.", 400);

      await notificationRepository.updateReadStateByUserId(req.user.id);

      return res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  },
  markAsReadByEmployeeId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new CustomError("User not found.", 400);

      await notificationRepository.updateReadStateByEmployeeId(req.user.id);

      return res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
