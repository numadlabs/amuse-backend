import { z } from "zod";

export const createCardSchema = z
  .object({
    nftUrl: z
      .string()
      .trim()
      .url("Invalid url.")
      .min(5, "Nft url must be at least 5 characters.")
      .max(255, "Nft url must be at most 255 characters."),
    instruction: z
      .string()
      .trim()
      .min(5, "Instruction must be at least 5 characters.")
      .max(255, "Instruction must be at most 255 characters."),
    benefits: z
      .string()
      .trim()
      .min(5, "Benefits must be at least 5 characters.")
      .max(255, "Benefits must be at most 5 characters."),
    restaurantId: z.string().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateCardSchema = z
  .object({
    nftUrl: z
      .string()
      .trim()
      .url()
      .min(5, "Nft url must be at least 5 characters.")
      .max(255, "Nft url must be at most 255 characters.")
      .optional(),
    instruction: z
      .string()
      .trim()
      .min(5, "Instruction must be at least 5 characters.")
      .max(255, "Instruction must be at most 255 characters.")
      .optional(),
    benefits: z
      .string()
      .trim()
      .min(5, "Benefits must be at least 5 characters.")
      .max(255, "Benefits must be at most 255 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");
