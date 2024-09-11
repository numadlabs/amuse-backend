import { z } from "zod";
import { ROLES } from "../types/db/enums";

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "Email must be at least 6 characters.")
      .max(254, "Email must be at most 254 characters.")
      .email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const emailSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "Email must be at least 6 characters.")
      .max(254, "Email must be at most 254 characters.")
      .email(),
  })
  .strict("Unexpected field detected.");

export const otpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "Email must be at least 6 characters.")
      .max(254, "Email must be at most 254 characters.")
      .email(),
    verificationCode: z.number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "Email must be at least 6 characters.")
      .max(254, "Email must be at most 254 characters.")
      .email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    nickname: z
      .string()
      .trim()
      .min(1, "Nickname must be at least 1 characters.")
      .max(30, "Nickname must be at most 30 characters."),
    verificationCode: z
      .number()
      .int()
      .lt(10000, "Verification code must exactly consist of 4 digits.")
      .gt(999, "Verification code must exactly consist of 4 digits."),
  })
  .strict("Unexpected field detected.");

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).max(255),
});

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "Email must be at least 6 characters.")
      .max(254, "Email must be at most 254 characters.")
      .email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    verificationCode: z
      .number()
      .int()
      .lt(10000, "Verification code must exactly consist of 4 digits.")
      .gt(999, "Verification code must exactly consist of 4 digits."),
  })
  .strict("Unexpected field detected.");

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const checkPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(30, "Password must be at most 30 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const authenticationTokenSchema = z
  .object({
    id: z.string().trim().uuid(),
    role: z.nativeEnum(ROLES),
  })
  .strict("Unexpected field detected.");
