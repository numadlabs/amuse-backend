import { z } from "zod";

export const createRestaurantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be at least 1 character.")
      .max(50, "Name must be at most 50 characters."),
    description: z
      .string()
      .trim()
      .min(1, "Description must be at least 1 character.")
      .max(512, "Description must be at most 512 characters."),
    location: z
      .string()
      .trim()
      .min(1, "Location must be at least 1 character.")
      .max(255, "Locatoin must be at most 255 characters."),
    googleMapsUrl: z
      .string()
      .trim()
      .min(1, "Google maps url must be at least 1 character.")
      .max(512, "Google maps url must be at least 512 characters.")
      .url(),
    categoryId: z.string().trim().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateRestaurantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be at least 1 character.")
      .max(50, "Name must be at most 50 characters.")
      .optional(),
    description: z
      .string()
      .trim()
      .min(1, "Description must be at least 1 character.")
      .max(512, "Description must be at most 512 characters.")
      .optional(),
    googleMapsUrl: z
      .string()
      .trim()
      .min(1, "Google maps url must be at least 1 character.")
      .max(512, "Google maps url must be at least 512 characters.")
      .url()
      .optional(),
    location: z
      .string()
      .trim()
      .min(1, "Location must be at least 1 character.")
      .max(255, "Locatoin must be at most 255 characters.")
      .optional(),
    categoryId: z.string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const rewardSystemSchema = z
  .object({
    perkOccurence: z
      .number()
      .int()
      .positive("Perk occurence must be positive.")
      .optional(),
    rewardAmount: z
      .number()
      .positive("Reward amount must be positive.")
      .optional(),
  })
  .strict("Unexpected field detected.");
