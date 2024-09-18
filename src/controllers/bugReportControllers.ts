import { NextFunction, Request, Response } from "express";
import { createBugReportSchema } from "../validations/bugReportSchema";
import { bugReportServices } from "../services/bugReportServices";
import { Insertable } from "kysely";
import { BugReport } from "../types/db/types";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";

export const bugReportController = {
  create: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    req.body = createBugReportSchema.parse(req.body);
    const data: Insertable<BugReport> = { ...req.body };

    try {
      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);
      const bugReport = await bugReportServices.create(data, req.user.id);

      return res.status(200).json({
        success: true,
        data: bugReport,
      });
    } catch (e) {
      next(e);
    }
  },
};
