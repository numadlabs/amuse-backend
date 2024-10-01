import { NextFunction, Request, Response } from "express";
import { addToBlacklist, removeFromBlacklist } from "../lib/blacklistHelper";

export const blacklistController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ip } = req.body;

      await addToBlacklist(ip);

      return res.status(200).json({
        success: true,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ip } = req.body;

      await removeFromBlacklist(ip);

      return res.status(200).json({
        success: true,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  },
};
