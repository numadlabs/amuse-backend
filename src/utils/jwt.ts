import { sign } from "jsonwebtoken";
import { Secret } from "jsonwebtoken"; // Import the Secret type
import { Prisma } from "@prisma/client";

export function generateAccessToken(user: Prisma.UserCreateInput) {
  const jwtAccesSecret: Secret | undefined = process.env.JWT_ACCESS_SECRET;
  if (!jwtAccesSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ id: user.id, role: user.role }, jwtAccesSecret, {
    expiresIn: "30m",
  });
}

export function generateRefreshToken(user: Prisma.UserCreateInput) {
  const jwtRefreshSecret: Secret | undefined = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined.");
  }
  return sign({ id: user.id, role: user.role }, jwtRefreshSecret, {
    expiresIn: "8h",
  });
}

export function generateTokens(user: Prisma.UserCreateInput) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
}
