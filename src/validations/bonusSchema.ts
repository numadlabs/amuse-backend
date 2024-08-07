import { z } from "zod";
import { BONUS_TYPE } from "../types/db/enums";

export const createBonusSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be at least 1 character.")
      .max(50, "Name must be at most 50 characters."),
    type: z.nativeEnum(BONUS_TYPE),
    totalSupply: z.number().int().positive("Total supply must be positive."),
    cardId: z.string().trim().uuid(),
    price: z.number().positive("Price must be positive.").optional(),
    visitNo: z
      .number()
      .int()
      .positive("Visit number must be positive.")
      .optional(),
  })
  .strict("Unexpected field detected.");

export const updateBonusSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be at least 1 character.")
      .max(50, "Name must be at most 50 characters.")
      .optional(),
    totalSupply: z
      .number()
      .int()
      .positive("Total supply must be positive.")
      .optional(),
    price: z.number().positive("Price must be positive.").optional(),
    visitNo: z.number().int().positive("Price must be positive.").optional(),
  })
  .strict("Unexpected field detected.");
