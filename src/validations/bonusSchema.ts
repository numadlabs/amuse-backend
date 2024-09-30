import { z } from "zod";
import { BONUS_TYPE } from "../types/db/enums";

export const createBonusSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(50, "The name must contain at most 50 characters."),
    type: z.nativeEnum(BONUS_TYPE),
    totalSupply: z
      .number({ message: "The supply must be a number." })
      .int({ message: "The supply must be a integer." })
      .positive("The supply must be a positive number."),
    cardId: z.string().trim().uuid(),
    price: z
      .number({ message: "The price must be a number." })
      .positive({ message: "The price must be a positive number." })
      .optional(),
    visitNo: z
      .number({ message: "The visit number must be a number." })
      .int({ message: "The visit number must be a integer." })
      .positive({ message: "The visit number must be a positive number." })
      .optional(),
  })
  .strict("Unexpected field detected.");

export const updateBonusSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(50, "The name must contain at most 50 characters.")
      .optional(),
    totalSupply: z
      .number({ message: "The supply must be a number." })
      .int({ message: "The supply must be a integer." })
      .positive({ message: "The supply must be a positive number." })
      .optional(),
    price: z.number().positive("The price must be positive number.").optional(),
    visitNo: z
      .number({ message: "The visit number must be a number" })
      .int({ message: "The visit number must be a integer" })
      .positive("The price must be a positive number.")
      .optional(),
  })
  .strict("Unexpected field detected.");
