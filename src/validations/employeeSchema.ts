import { string, z } from "zod";
import { ROLES } from "../types/db/enums";

export const createEmployeeSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(50, "Email must be at most 30 characters.")
      .email(),
    fullname: string().trim().min(1).max(30).optional(),
    role: z.nativeEnum(ROLES),
    restaurantId: string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const updateEmployeeSchema = z
  .object({
    fullname: string()
      .trim()
      .min(1, "First name must be at least 1 character.")
      .max(50, "First name must be at most 50 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");

export const passwordSchema = z
  .object({
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
