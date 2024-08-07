import { z } from "zod";

export const deviceSchema = z
  .object({
    pushToken: z
      .string()
      .trim()
      .min(5, "Push token must be at least 5 characters.")
      .max(100, "Push token must be at most 100 characters."),
  })
  .strict("Unexpected field detected.");
