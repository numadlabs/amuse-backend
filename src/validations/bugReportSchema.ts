import { z } from "zod";

export const createBugReportSchema = z.object({
  deviceModel: z
    .string()
    .trim()
    .min(1)
    .max(255, `The device model can contain a maximum of 255 characters.`),
  appVersion: z
    .string()
    .trim()
    .max(50, `The app version can contain a maximum of 50 characters.`),
  osVersion: z
    .string()
    .trim()
    .max(
      50,
      `The operating system version can contain a maximum of 50 characters.`
    ),
  reason: z
    .string()
    .trim()
    .max(512, `The crash reason can contain a maximum of 512 characters.`),
  description: z
    .string()
    .trim()
    .max(1024, `The description can contain a maximum of 1024 characters.`)
    .optional(),
});
