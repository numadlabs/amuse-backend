export const verificationCodeConstants = {
  MIN_VALUE: 1000,
  MAX_VALUE: 9999,
  EMAIL_EXPIRATION_TIME: "5m",
  TEL_EXPIRATION_TIME: "5m",
};

//IN NUMBER OF SECONDS
export const TAP_EXPIRATION_TIME = 60;
export const BONUS_REDEEM_EXPIRATION_TIME = 60;

export const s3BucketName = "numadlabs-amuse";
export const fileSizeLimit = 3145728; //3MB in binary

//will be needed for parsing multiple images per requests
/* export const restaurantFileFields = [
  { name: "logo", maxCount: 2 },
  { name: "text", maxCount: 1 },
]; */
