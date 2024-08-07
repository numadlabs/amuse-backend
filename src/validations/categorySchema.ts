import { z } from "zod";

export const categorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Category must be at least 5 characters.")
      .max(50, "Category must be at most 50 characters."),
  })
  .strict("Unexpected field detected.");
