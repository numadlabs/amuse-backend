import { NextFunction, Request, Response } from "express";
import { countryRepository } from "../repository/countryRepository";

export const countryController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countries = await countryRepository.get();

      return res.status(200).json({
        success: true,
        data: {
          countries: countries,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
