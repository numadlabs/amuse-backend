import { z } from "zod";

export const notificationSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message must be at least 1 character.")
      .max(100, "Message must be at most 100 characters."),
  })
  .strict("Unexpected field detected.");
