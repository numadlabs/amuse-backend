import { z } from "zod";

export const deviceSchema = z
  .object({
    pushToken: z
      .string()
      .trim()
      .min(5, "The push token must consist of at least 5 characters.")
      .max(100, "The push token must consist of at most 100 characters."),
  })
  .strict("Unexpected field detected.");
