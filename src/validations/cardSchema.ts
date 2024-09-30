import { z } from "zod";

export const createCardSchema = z
  .object({
    nftUrl: z
      .string()
      .trim()
      .url("Invalid url format.")
      .min(5, "The nft url must contain at least 5 characters.")
      .max(255, "the nft url must contain at most 255 characters."),
    instruction: z
      .string()
      .trim()
      .min(5, "The instruction must contain at least 5 characters.")
      .max(255, "The instruction must contain at most 255 characters."),
    benefits: z
      .string()
      .trim()
      .min(5, "The benefits must contain at least 5 characters.")
      .max(255, "The benefits must contain at most 255 characters."),
    restaurantId: z.string().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateCardSchema = z
  .object({
    nftUrl: z
      .string()
      .trim()
      .url()
      .min(5, "The nft url must contain at least 5 characters.")
      .max(255, "The nft url must contain at most 255 characters.")
      .optional(),
    instruction: z
      .string()
      .trim()
      .min(5, "The instruction must contain at least 5 characters.")
      .max(255, "The instruction must contain at most 255 characters.")
      .optional(),
    benefits: z
      .string()
      .trim()
      .min(5, "The benefits must contain at least 5 characters.")
      .max(255, "The benefits must contain at most 255 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");
