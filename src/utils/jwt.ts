import { sign, verify, Secret } from "jsonwebtoken";
import { Employee, User } from "../types/db/types";
import { Insertable } from "kysely";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import { CustomError } from "../exceptions/CustomError";

const ACCESS_TOKEN_EXPIRATION_TIME = config.JWT_ACCESS_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = config.JWT_REFRESH_EXPIRATION_TIME;
const jwtAccessSecret: Secret = config.JWT_ACCESS_SECRET;
const jwtRefreshSecret: Secret = config.JWT_REFRESH_SECRET;

export function generateAccessToken(
  user: Insertable<User> | Insertable<Employee>
) {
  return sign({ id: user.id, role: user.role }, jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
  });
}

export function generateVerificationToken(
  verificationCode: number,
  duration: string
) {
  const jwtVerificationSecret = config.JWT_VERIFICATION_SECRET;
  if (!jwtVerificationSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ verificationCode: verificationCode }, jwtVerificationSecret, {
    expiresIn: duration,
  });
}

export function verifyRefreshToken(token: string) {
  let tokens;
  jwt.verify(token, jwtRefreshSecret, (err: any, user: any) => {
    if (err)
      throw new CustomError(`Either refresh token is invalid or expired.`, 401);
    tokens = generateTokens(user);
  });

  return tokens;
}

export function extractVerification(token: string) {
  const jwtVerificationSecret = config.JWT_VERIFICATION_SECRET;
  if (!jwtVerificationSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  let verificationCode: number = 0;
  verify(token, jwtVerificationSecret, (err, payload: any) => {
    if (err)
      throw new CustomError(
        `The verification code is expired or invalid.`,
        400
      );
    verificationCode = payload.verificationCode;
  });
  return verificationCode;
}

export function generateRefreshToken(
  user: Insertable<User> | Insertable<Employee>
) {
  return sign({ id: user.id, role: user.role }, jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
  });
}

export function generateTokens(user: Insertable<User> | Insertable<Employee>) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
}
