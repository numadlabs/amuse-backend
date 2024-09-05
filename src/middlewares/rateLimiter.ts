import { createRateLimiter } from "../lib/createRateLimiter";

export const rateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-global",
  limit: 1000,
  window: 60,
});

export const authRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-auth",
  limit: 5,
  window: 5 * 60,
});

export const sendOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-send",
  limit: 5,
  window: 5 * 60,
});

export const checkOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-check",
  limit: 10,
  window: 5 * 60,
});
