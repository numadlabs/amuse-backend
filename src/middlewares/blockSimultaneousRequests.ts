import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../custom";
import { pubClient } from "../app";
import { CustomError } from "../exceptions/CustomError";

const BLOCKED_REQUEST_TIMEOUT = 60;

const blockSimultaneousRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) throw new CustomError("Error parsing the auth token.", 400);

  try {
    const active = await pubClient.get(`req:${userId}`);

    if (active) {
      res
        .status(429)
        .send(
          "Too many requests. Please wait until the previous request is complete."
        );
    } else {
      await pubClient.set(
        `req:${userId}`,
        "active",
        "EX",
        BLOCKED_REQUEST_TIMEOUT
      );

      res.on("finish", async () => {
        await pubClient.del(`req:${userId}`);
      });

      next();
    }
  } catch (error) {
    console.error("Redis error:", error);
    throw new Error("Redis error.");
  }
};

export default blockSimultaneousRequests;
