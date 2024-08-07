import { z } from "zod";

export const deviceSchema = z
  .object({
    pushToken: z.string().min(1).max(255).trim(),
  })
  .strict("Unexpected field detected.");
