import { number, string, z } from "zod";
import { ROLES } from "../types/db/enums";

export const loginSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(30, "Email must be at most 30 characters.")
      .email(),
    password: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const emailSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(30, "Email must be at most 30 characters.")
      .email(),
  })
  .strict("Unexpected field detected.");

export const otpSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(50, "Email must be at most 50 characters.")
      .email(),
    verificationCode: number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const registerSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(50, "Email must be at most 50 characters.")
      .email(),
    password: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    nickname: string()
      .trim()
      .min(1, "Nickname must be at least 1 characters.")
      .max(30, "Nickname must be at most 30 characters."),
    verificationCode: number()
      .int()
      .lt(10000, "Verification code must exactly consist of 4 digits.")
      .gt(999, "Verification code must exactly consist of 4 digits."),
  })
  .strict("Unexpected field detected.");

export const refreshTokenSchema = z.object({
  refreshToken: string().min(1).max(255),
});

export const forgotPasswordSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(50, "Email must be at most 50 characters.")
      .email(),
    password: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    verificationCode: number()
      .int()
      .lt(10000, "Verification code must exactly consist of 4 digits.")
      .gt(999, "Verification code must exactly consist of 4 digits."),
  })
  .strict("Unexpected field detected.");

export const changePasswordSchema = z
  .object({
    currentPassword: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    newPassword: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const checkPasswordSchema = z
  .object({
    currentPassword: string()
      .trim()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const authenticationTokenSchema = z
  .object({
    id: string().trim().uuid(),
    role: z.nativeEnum(ROLES),
  })
  .strict("Unexpected field detected.");
