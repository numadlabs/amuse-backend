import { z } from "zod";

export const createRestaurantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(50, "The name must contain at most 50 characters."),
    description: z
      .string()
      .trim()
      .min(1, "The description must be at least 1 character.")
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
      .min(1, "The name must contain at least 1 character.")
      .max(50, "The name must contain at most 50 characters.")
      .optional(),
    description: z
      .string()
      .trim()
      .min(1, "The description must be at least 1 character long.")
      .max(512, "The description must be at most 512 characters long.")
      .optional(),
    googleMapsUrl: z
      .string()
      .trim()
      .min(1, "The google maps url must be at least 1 character long.")
      .max(512, "The google maps url must be at most 512 characters long.")
      .url("Invalid url format.")
      .optional(),
    location: z
      .string()
      .trim()
      .min(1, "The location must be at least 1 character long.")
      .max(255, "The location must be at most 255 characters long.")
      .optional(),
    categoryId: z.string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");

export const rewardSystemSchema = z
  .object({
    perkOccurence: z
      .number({ message: "The perk occurence must be a number" })
      .int("The perk occurence must be a integer.")
      .positive("The perk occurence must be positive number.")
      .optional(),
    rewardAmount: z
      .number({ message: "The reward amount must be a number" })
      .positive("The reward amount must be positive number.")
      .optional(),
  })
  .strict("Unexpected field detected.");
