import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import logger from "../config/winston";
import { config } from "../config/config";
import { redis } from "../server";

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

interface RateLimiterOptions {
  keyPrefix: string;
  limit: number;
  window: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { keyPrefix, limit, window } = options;

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (config.NODE_ENV !== "") {
      return next();
    }

    const ip: string = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;

    try {
      const multi = redis.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();

      if (!results) {
        throw new Error("Redis transaction failed");
      }

      const [incrResult, expireResult] = results;
      const count = incrResult[1] as number;

      const now = Date.now();
      const resetTime = Math.ceil(now / 1000) * 1000 + window * 1000;

      const rateLimitInfo: RateLimitInfo = {
        limit,
        current: count,
        remaining: Math.max(0, limit - count),
        resetTime,
      };

      if (count > limit) {
        throw new CustomError("Too Many Requests", 429);
      }

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", rateLimitInfo.remaining);
      res.setHeader("X-RateLimit-Reset", Math.floor(resetTime / 1000));

      next();
    } catch (err) {
      next(err);
    }
  };
}
