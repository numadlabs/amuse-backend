import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import logger from "../config/winston";
import { config } from "../config/config";
import { redis } from "../server";
import { emailSchema } from "../validations/authSchema";
import { encryptionHelper } from "./encryptionHelper";
import { rateLimiterEmailSchema } from "../validations/sharedSchema";

interface RateLimiterOptions {
  keyPrefix: string;
  limit: number;
  window: number;
}

export function createRateLimiterByEmail(options: RateLimiterOptions) {
  const { keyPrefix, limit, window } = options;

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // if (config.NODE_ENV !== "production") {
    //   return next();
    // }

    try {
      // if (!req.ip && !req.socket.remoteAddress) {
      //   logger.warn("Client ip not found.");
      // }
      // const ip: string = req.ip || req.socket.remoteAddress || "unknown";

      const result = rateLimiterEmailSchema.safeParse(req.body);
      if (result.error)
        return res.status(400).json({
          success: false,
          data: null,
          error: `${result.error.issues[0].message}`,
        });

      if (!result.data.email)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Email must be provided.",
        });

      const encryptedEmail = encryptionHelper.encryptData(result.data.email);
      const key = `${keyPrefix}:${encryptedEmail}`;
      const now = Date.now();
      const windowStart = now - window * 1000;

      await redis
        .multi()
        .zadd(key, now, now)
        .zremrangebyscore(key, "-inf", windowStart)
        .zcard(key)
        .pexpire(key, window * 1000)
        .exec((err, results: any) => {
          if (err) {
            logger.error("Rate limiting error:", err);
            return next(err);
          }

          const requestCount = results[2][1];

          if (requestCount > limit) {
            return res.status(429).json({
              success: false,
              data: null,
              error:
                "You have exceeded the request limit. Please try again in a few moment.",
            });
          }

          res.setHeader("X-RateLimit-Limit", limit);
          res.setHeader(
            "X-RateLimit-Remaining",
            Math.max(limit - requestCount, 0)
          );
          res.setHeader("X-RateLimit-Reset", Math.ceil(now / 1000) + window);

          next();
        });
    } catch (error) {
      logger.error("Rate limiting error:", error);
      next(error);
    }
  };
}
