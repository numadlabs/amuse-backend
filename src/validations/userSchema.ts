import { date, number, string, z } from "zod";

export const updateUserInfoSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(1, "Nickname must be at least 1 character.")
      .max(30, "Nickname must be at most 30 characters.")
      .optional(),
    location: z
      .string()
      .trim()
      .min(1, "Location must be at least 1 character.")
      .max(30, "Location must be at most 30 characters.")
      .optional(),
    dateOfBirth: z
      .date()
      .min(new Date("1900-01-01"))
      .max(new Date())
      .optional(),
  })
  .strict("Unexpected field detected.");
