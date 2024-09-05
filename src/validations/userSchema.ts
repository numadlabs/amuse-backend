import { date, number, string, z } from "zod";

export const updateUserInfoSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .max(30, "Nickname must be at most 30 characters.")
      .optional(),
    countryId: z
      .string()
      .trim()
      .uuid()
      .max(100, "Location must be at most 100 characters.")
      .optional(),
    birthYear: z
      .string()
      .trim()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), {
        message: "Invalid number format",
      })
      .refine((val) => val >= 1900 && val <= 2024, {
        message: "Month must be between 1 and 12",
      })
      .optional(),
    birthMonth: z
      .string()
      .trim()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), {
        message: "Invalid number format",
      })
      .refine((val) => val >= 1 && val <= 12, {
        message: "Month must be between 1 and 12",
      })
      .optional(),
    profilePicture: z
      .string()
      .trim()
      .max(100, "Profile picture must be at most 100 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");
