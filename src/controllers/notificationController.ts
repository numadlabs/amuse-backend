import { NextFunction, Request, Response } from "express";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";
import { notificationServices } from "../services/notificationServices";
import { notificationSchema } from "../validations/notificationSchema";

export const notificationController = {
  send: async (req: Request, res: Response, next: NextFunction) => {
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
};
