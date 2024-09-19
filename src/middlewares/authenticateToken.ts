import { NextFunction, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../../custom";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { CustomError } from "../exceptions/CustomError";

export function authenticateToken() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const jwtAuthSecret = config.JWT_ACCESS_SECRET;
      const authHeader = req.header("Authorization");
      const token = authHeader?.split(" ")[1];

      if (!jwtAuthSecret) {
        throw new CustomError("Server configuration error.", 500);
      }

      if (!token) {
        throw new CustomError("Authentication required.", 401);
      }

      const user: AuthenticatedUser = await new Promise((resolve, reject) => {
        jwt.verify(token, jwtAuthSecret, (err, decoded) => {
          if (err)
            reject(
              new CustomError("Either auth token is invalid or expired.", 401)
            );
          else resolve(decoded as AuthenticatedUser);
        });
      });

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
