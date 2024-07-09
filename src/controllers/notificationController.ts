import { NextFunction, Request, Response } from "express";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";
import { notificationServices } from "../services/notificationServices";

export const notificationController = {
  send: async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;

    try {
      if (!message) throw new CustomError("Please provide the message.", 400);

      const devices = await deviceRepository.get();
      if (devices.length === 0) throw new CustomError("No devices found.", 400);

      const tickets = await notificationServices.send(devices, message);

      return res.status(200).json({ success: true, data: tickets });
    } catch (e) {
      next(e);
    }
  },
};
