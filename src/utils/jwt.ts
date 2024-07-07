import { sign, verify } from "jsonwebtoken";
import { Secret } from "jsonwebtoken"; // Import the Secret type
import { User } from "../types/db/types";
import { Insertable } from "kysely";

const ACCESS_TOKEN_EXPIRATION_TIME = process.env.JWT_ACCESS_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = process.env.JWT_REFRESH_EXPIRATION_TIME;

export function generateAccessToken(user: Insertable<User>) {
  const jwtAccesSecret: Secret | undefined = process.env.JWT_ACCESS_SECRET;
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
  const jwtVerificationSecret = process.env.JWT_VERIFICATION_SECRET;
  if (!jwtVerificationSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ verificationCode: verificationCode }, jwtVerificationSecret, {
    expiresIn: duration,
  });
}
//turn it into function that just returns JWT-payload
export function extractVerification(token: string) {
  const jwtVerificationSecret = process.env.JWT_VERIFICATION_SECRET;
  if (!jwtVerificationSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  let verificationCode: number = 0;
  verify(token, jwtVerificationSecret, (err, payload: any) => {
    if (err) throw new Error(`Invalid token ${err}`);
    verificationCode = payload.verificationCode;
  });
  return verificationCode;
}

export function generateRefreshToken(user: Insertable<User>) {
  const jwtRefreshSecret: Secret | undefined = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ id: user.id, role: user.role }, jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
  });
}

export function generateTokens(user: Insertable<User>) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
}
