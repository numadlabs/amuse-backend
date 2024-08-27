import e, { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { CustomError } from "../exceptions/CustomError";

export function authenticateToken() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const jwtAuthSecret = config.JWT_ACCESS_SECRET;
    const token = req.header("Authorization")?.split(" ")[1];

    if (!jwtAuthSecret) {
      throw new Error("jwtAuthSecret is not defined.");
    }
    if (!token) throw new CustomError("Authentication required.", 401);

    jwt.verify(token, jwtAuthSecret, (err, user: any) => {
      if (err) throw new CustomError(`Invalid token ${e}`, 401);

      req.user = user;
      next();
    });
  };
}
