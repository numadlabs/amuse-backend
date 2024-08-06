import { number, string, z } from "zod";
import { ROLES } from "../types/db/enums";

export const loginSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    password: string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const emailSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format"
      ),
  })
  .strict("Unexpected field detected.");

export const otpSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    verificationCode: number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const tempSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    emailVerificationCode: number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const registerSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    password: string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    nickname: string().min(1).max(30),
    verificationCode: number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const refreshTokenSchema = z.object({ refreshToken: string() });

export const forgotPasswordSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    password: string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    verificationCode: number().int().lt(10000).gt(999),
  })
  .strict("Unexpected field detected.");

export const changePasswordSchema = z
  .object({
    oldPassword: string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    newPassword: string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const authenticationTokenSchema = z
  .object({
    id: string().uuid(),
    role: z.nativeEnum(ROLES),
  })
  .strict("Unexpected field detected.");
