"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSizeLimit = exports.s3BucketName = exports.BONUS_REDEEM_EXPIRATION_TIME = exports.TAP_EXPIRATION_TIME = exports.verificationCodeConstants = void 0;
exports.verificationCodeConstants = {
    MIN_VALUE: 1000,
    MAX_VALUE: 9999,
    EMAIL_EXPIRATION_TIME: "5m",
    TEL_EXPIRATION_TIME: "5m",
};
//IN NUMBER OF SECONDS
exports.TAP_EXPIRATION_TIME = 60;
exports.BONUS_REDEEM_EXPIRATION_TIME = 60;
exports.s3BucketName = "numadlabs-amuse";
exports.fileSizeLimit = 3145728; //3MB in binary
//will be needed for parsing multiple images per requests
/* export const restaurantFileFields = [
  { name: "logo", maxCount: 2 },
  { name: "text", maxCount: 1 },
]; */
