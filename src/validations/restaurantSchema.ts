import { z } from "zod";

export const createRestaurantSchema = z
  .object({
    name: z.string().min(1).max(30),
    description: z.string().min(1).max(30),
    googleMapsUrl: z.string().min(1).url(),
    categoryId: z.string().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateRestaurantSchema = z
  .object({
    name: z.string().min(1).max(30).optional(),
    description: z.string().min(1).max(30).optional(),
    googleMapsUrl: z.string().min(1).url().optional(),
    categoryId: z.string().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const rewardSystemSchema = z
  .object({
    perkOccurent: z.number().int().positive().optional(),
    rewardAmount: z.number().positive().optional(),
  })
  .strict("Unexpected field detected.");
