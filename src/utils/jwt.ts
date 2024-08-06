import { sign, verify, Secret } from "jsonwebtoken";
import { Employee, User } from "../types/db/types";
import { Insertable } from "kysely";
import { config } from "../config/config";

const ACCESS_TOKEN_EXPIRATION_TIME = config.JWT_ACCESS_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = config.JWT_REFRESH_EXPIRATION_TIME;

export function generateAccessToken(
  user: Insertable<User> | Insertable<Employee>
) {
  const jwtAccesSecret: Secret | undefined = config.JWT_ACCESS_SECRET;
  if (!jwtAccesSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ id: user.id, role: user.role }, jwtAccesSecret, {
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
//turn it into function that just returns JWT-payload
export function extractVerification(token: string) {
  const jwtVerificationSecret = config.JWT_VERIFICATION_SECRET;
  if (!jwtVerificationSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  let verificationCode: number = 0;
  verify(token, jwtVerificationSecret, (err, payload: any) => {
    if (err) throw new Error(`The verification code is expired or invalid.`);
    verificationCode = payload.verificationCode;
  });
  return verificationCode;
}

export function generateRefreshToken(
  user: Insertable<User> | Insertable<Employee>
) {
  const jwtRefreshSecret: Secret | undefined = config.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
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
