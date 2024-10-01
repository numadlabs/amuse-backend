import { z } from "zod";
import { ROLES } from "../types/db/enums";

export const createEmployeeSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(6, "The email must be at least 6 characters long.")
      .max(255, "The email can be a maximum of 255 characters long.")
      .email("Invalid email format."),
    fullname: z
      .string()
      .trim()
      .min(1, "The name must be contain at least 1 character.")
      .max(30, "The name must be contain at most 30 character.")
      .optional(),
    role: z.nativeEnum(ROLES, { message: "Invalid role." }),
    restaurantId: z.string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const updateEmployeeSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(50, "The name must contain at most 50 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "The password must be at least 8 characters long.")
      .max(128, "The password can be a maximum of 30 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/,
        "The password must contain at least one uppercase letter, one lowercase letter, and one number."
      ),
  })
  .strict("Unexpected field detected.");
