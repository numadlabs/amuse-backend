import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { deviceRepository } from "../repository/deviceRepository";
import { deviceServices } from "../services/deviceServices";

export const deviceController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Device> = { ...req.body };

    try {
      if (!data.pushToken)
        throw new CustomError("Please provide push token.", 400);

      const device = await deviceServices.create(data);

      return res.status(200).json({
        success: true,
        data: device,
      });
    } catch (e) {
      next(e);
    }
  },
};
