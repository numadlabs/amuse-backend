import { NextFunction, Request, Response } from "express";
import { Insertable } from "kysely";
import { Invite } from "../types/db/types";
import { inviteServices } from "../services/inviteServices";

export const inviteController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Invite> = { ...req.body };

    try {
      const invite = await inviteServices.create(data);

      return res.status(200).json({ success: true, data: invite });
    } catch (e) {
      next(e);
    }
  },
  checkExists: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const result = await inviteServices.checkIfRegistered(id);

      return res.status(200).json({
        success: true,
        data: "Employee with the invited email has not been registered.",
      });
    } catch (e) {
      next(e);
    }
  },
  setOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const invite = await inviteServices.setOTP(id);

      return res.status(200).json({ success: true, data: invite });
    } catch (e) {
      next(e);
    }
  },
};
