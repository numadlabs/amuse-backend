import { string, z } from "zod";
import { ROLES } from "../types/db/enums";

export const createEmployeeSchema = z
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
    firstname: string().trim().min(1).max(30).optional(),
    lastname: string().trim().min(1).max(30).optional(),
    role: z.nativeEnum(ROLES),
    restaurantId: string().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const updateEmployeeSchema = z
  .object({
    firstname: string().trim().min(1).max(30).optional(),
    lastname: string().trim().min(1).max(30).optional(),
  })
  .strict("Unexpected field detected.");
