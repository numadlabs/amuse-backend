import { NextFunction, Request, Response } from "express";
import { redis } from "../server";
import logger from "../config/winston";
import { config } from "../config/config";

const BLACKLIST_SET = "ip_blacklist";

export const ipBlacklistMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (config.NODE_ENV !== "production") {
    return next();
  }

  const clientIP = req.ip || req.socket.remoteAddress || "";
  logger.info(clientIP);

  next();

  // try {
  //   const clientIP = req.ip || req.connection.remoteAddress || "";

  //   const isBlacklisted = await redis.sismember(BLACKLIST_SET, clientIP);
  //   logger.info(clientIP);

  //   if (isBlacklisted) {
  //     return res
  //       .status(403)
  //       .json({ error: "Access denied. Your IP is blacklisted." });
  //   }

  //   next();
  // } catch (error) {
  //   logger.error("Error checking IP blacklist:", error);
  //   next();
  // }
};
