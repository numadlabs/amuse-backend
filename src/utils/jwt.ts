import { sign, verify, Secret } from "jsonwebtoken";
import { Employee, User } from "../types/db/types";
import { Insertable } from "kysely";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import { CustomError } from "../exceptions/CustomError";
import { ROLES } from "../types/db/enums";
import { AuthenticatedUser } from "../../custom";

const ACCESS_TOKEN_EXPIRATION_TIME = config.JWT_ACCESS_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = config.JWT_REFRESH_EXPIRATION_TIME;
const jwtAccessSecret: Secret = config.JWT_ACCESS_SECRET;
const jwtRefreshSecret: Secret = config.JWT_REFRESH_SECRET;

type JwtPayload = {
  id: string;
  role: ROLES;
};

export function generateAccessToken(payload: JwtPayload) {
  return sign({ id: payload.id, role: payload.role }, jwtAccessSecret, {
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

export function verifyRefreshToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtRefreshSecret, (err: any, payload: any) => {
      if (err) {
        reject(
          new CustomError(`Either refresh token is invalid or expired.`, 401)
        );
      } else {
        const tokens = generateTokens({ id: payload.id, role: payload.role });
        resolve(tokens);
      }
    });
  });
}

export async function verifyAccessToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtAccessSecret, (err, decoded) => {
      if (err)
        reject(
          new CustomError("Either access token is invalid or expired.", 401)
        );
      else resolve(decoded as AuthenticatedUser);
    });
  });
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

export function generateRefreshToken(payload: JwtPayload) {
  return sign({ id: payload.id, role: payload.role }, jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
  });
}

export function generateTokens(payload: JwtPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
}
