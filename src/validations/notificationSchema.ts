import { z } from "zod";

export const notificationSchema = z
  .object({ message: z.string().min(1).max(100) })
  .strict("Unexpected field detected.");
