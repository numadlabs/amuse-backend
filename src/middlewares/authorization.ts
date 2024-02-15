import { NextFunction, Response } from "express";
import { ROLES } from "../types/db/enums";
import { AuthenticatedRequest } from "../../custom";

export function authorize(...roles: ROLES[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role)
      throw new Error(
        "Not authenticated/No role provided for authorization check"
      );

    console.log(roles);
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      throw new Error("You are not allowed to do this action.");
    }

    next();
  };
}
