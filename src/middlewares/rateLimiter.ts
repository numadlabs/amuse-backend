import { createRateLimiter } from "../lib/createRateLimiter";

export const rateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-global",
  limit: 200,
  window: 5 * 60,
});

export const authRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-auth",
  limit: 10,
  window: 15 * 60,
});

export const sendOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-send",
  limit: 5,
  window: 30 * 60,
});

export const checkOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-check",
  limit: 5,
  window: 15 * 60,
});

export const forgotPasswordOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-check",
  limit: 5,
  window: 15 * 60,
});

export const registerOtpRateLimiter = createRateLimiter({
  keyPrefix: "ratelimiter-otp-check",
  limit: 5,
  window: 15 * 60,
});
