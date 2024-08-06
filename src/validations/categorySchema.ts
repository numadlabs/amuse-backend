import { z } from "zod";

export const categorySchema = z
  .object({ name: z.string().min(1).max(255).trim() })
  .strict("Unexpected field detected.");
