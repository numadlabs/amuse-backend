import { z } from "zod";

export const createBugReportSchema = z.object({
  deviceModel: z.string().trim().min(1).max(255),
  appVersion: z.string().trim().max(50),
  osVersion: z.string().trim().max(50),
  reason: z.string().trim().max(512),
  description: z.string().trim().max(512).optional(),
});
