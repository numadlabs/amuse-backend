import { createRateLimiterByEmail } from "../lib/createRateLimiter";

// export const rateLimiter = createRateLimiter({
//   keyPrefix: "ratelimiter-global",
//   limit: 250,
//   window: 5 * 60,
// });

export const authRateLimiter = createRateLimiterByEmail({
  keyPrefix: "ratelimiter-auth",
  limit: 10,
  window: 15 * 60,
});

export const sendOtpRateLimiter = createRateLimiterByEmail({
  keyPrefix: "ratelimiter-otp-send",
  limit: 5,
  window: 15 * 60,
});

export const checkOtpRateLimiter = createRateLimiterByEmail({
  keyPrefix: "ratelimiter-otp-check",
  limit: 5,
  window: 15 * 60,
});

export const forgotPasswordOtpRateLimiter = createRateLimiterByEmail({
  keyPrefix: "ratelimiter-forgot-password",
  limit: 5,
  window: 15 * 60,
});

export const registerOtpRateLimiter = createRateLimiterByEmail({
  keyPrefix: "ratelimiter-register",
  limit: 5,
  window: 15 * 60,
});
