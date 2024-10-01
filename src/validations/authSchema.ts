import { z } from "zod";
import { ROLES } from "../types/db/enums";

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email({ message: "Invalid email format." }),
    password: z
      .string()
      .min(8, "The password must be at least 8 characters long.")
      .max(128, "The password can be a maximum of 30 characters long.")
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
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email({ message: "Invalid email format." }),
  })
  .strict("Unexpected field detected.");

export const otpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email({ message: "Invalid email format." }),
    verificationCode: z
      .number()
      .int()
      .lt(10000, "The verification code must consist of exactly 4 digits.")
      .gt(999, "The verification code must consist of exactly 4 digits."),
  })
  .strict("Unexpected field detected.");

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email({ message: "Invalid email format." }),
    password: z
      .string()
      .min(8, "The password must be at least 8 characters long.")
      .max(128, "The password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    nickname: z
      .string()
      .trim()
      .min(1, "The nickname must contain at least 1 character.")
      .max(30, "The nickname must contain at most 30 characters."),
    verificationCode: z
      .number()
      .int()
      .lt(10000, "The verification code must consist of exactly 4 digits.")
      .gt(999, "The verification code must consist of exactly 4 digits."),
  })
  .strict("Unexpected field detected.");

export const accessTokenStringSchema = z.string().min(1).max(255);

export const accessTokenRequestSchema = z.object({
  accessToken: z.string().min(1).max(255),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).max(255),
});

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email({ message: "Invalid email format." }),
    password: z
      .string()
      .min(8, "The password must be at least 8 characters long.")
      .max(128, "The password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    verificationCode: z
      .number()
      .int()
      .lt(10000, "The verification code must consist of exactly 4 digits.")
      .gt(999, "The verification code must consist of exactly 4 digits."),
  })
  .strict("Unexpected field detected.");

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "The current password must be at least 8 characters long.")
      .max(128, "The current password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
    newPassword: z
      .string()
      .min(8, "The new password must be at least 8 characters long.")
      .max(128, "The new password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const checkPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "The current password must be at least 8 characters long.")
      .max(128, "The current password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");

export const authenticationTokenSchema = z
  .object({
    id: z.string().trim().uuid(),
    role: z.nativeEnum(ROLES),
  })
  .strict("Unexpected field detected.");
