import { z } from "zod";

export const categorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The category name must contain at least 5 characters.")
      .max(50, "The category name must contain at most 50 characters."),
  })
  .strict("Unexpected field detected.");
