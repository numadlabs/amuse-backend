import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { config } from "../config/config";
import { redis } from "../server";

const BLOCKED_REQUEST_TIMEOUT = 30;

const blockSimultaneousRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (config.NODE_ENV !== "production") {
    return next();
  }

  try {
    const userId = req.user?.id;
    if (!userId) throw new CustomError("Error parsing the auth token.", 400);

    const active = await redis.get(`req:${userId}`);

    if (active) {
      throw new CustomError(
        "Please wait until the previous request is complete.",
        429
      );
    } else {
      await redis.set(`req:${userId}`, "active", "EX", BLOCKED_REQUEST_TIMEOUT);

      res.on("finish", async () => {
        await redis.del(`req:${userId}`);
      });

      next();
    }
  } catch (error) {
    next(error);
  }
};

export default blockSimultaneousRequests;
