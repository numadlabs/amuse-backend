import { z } from "zod";

export const createCardSchema = z
  .object({
    nftUrl: z.string().url().min(1).max(255),
    instruction: z.string().min(1).max(255),
    benefits: z.string().min(1).max(255),
    restaurantId: z.string().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateCardSchema = z
  .object({
    nftUrl: z.string().url().min(1).max(255).optional(),
    instruction: z.string().min(1).max(255).optional(),
    benefits: z.string().min(1).max(255).optional(),
  })
  .strict("Unexpected field detected.");
