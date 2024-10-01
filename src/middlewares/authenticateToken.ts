import { NextFunction, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../../custom";
import { config } from "../config/config";
import { CustomError } from "../exceptions/CustomError";
import { verifyAccessToken } from "../utils/jwt";
import { accessTokenStringSchema } from "../validations/authSchema";

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
      const result = accessTokenStringSchema.safeParse(token);

      if (!jwtAuthSecret) {
        throw new CustomError("Server configuration error.", 500);
      }

      if (!result.data) {
        throw new CustomError("Authentication required.", 401);
      }

      const user: AuthenticatedUser = await verifyAccessToken(result.data);

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
