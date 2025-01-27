import { config } from "../config/config";

export const verificationCodeConstants = {
  MIN_VALUE: 1000,
  MAX_VALUE: 9999,
  EMAIL_EXPIRATION_TIME: "5m",
};

//IN NUMBER OF SECONDS
export const TAP_EXPIRATION_TIME =
  config.NODE_ENV === "production" ? 300 : 100000;
export const BONUS_REDEEM_EXPIRATION_TIME =
  config.NODE_ENV === "production" ? 300 : 100000;

//IN BINARY
export const sizeLimitConstants = {
  fileSizeLimit: 5 * 1024 * 1024, //5MB
  formDataSizeLimit: "3mb", //10MB
  jsonSizeLimit: "1mb",
};

//IN NUMBER OF MINUTES
export const TAP_LOCK_TIME = config.NODE_ENV === "production" ? 24 : 0;

export const BOOST_MULTIPLIER = 1.2;
