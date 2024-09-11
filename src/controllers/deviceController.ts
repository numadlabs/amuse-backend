import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { deviceServices } from "../services/deviceServices";
import { deviceSchema } from "../validations/deviceSchema";

export const deviceController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = deviceSchema.parse(req.body);
      const data: Insertable<Device> = { ...req.body };

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
