import { string, z } from "zod";
import { ROLES } from "../types/db/enums";

export const createEmployeeSchema = z
  .object({
    email: string()
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters.")
      .max(50, "Email must be at most 30 characters.")
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Invalid email format."
      ),
    firstname: string().trim().min(1).max(30).optional(),
    lastname: string().trim().min(1).max(30).optional(),
    role: z.nativeEnum(ROLES),
    restaurantId: string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const updateEmployeeSchema = z
  .object({
    firstname: string()
      .trim()
      .min(1, "First name must be at least 1 character.")
      .max(30, "First name must be at most 30 characters.")
      .optional(),
    lastname: string()
      .trim()
      .min(1, "Last name must be at least 1 character.")
      .max(30, "Last name must be at most 30 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");
