import { date, number, string, z } from "zod";

export const updateUserInfoSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .max(30, "Nickname must be at most 30 characters.")
      .optional(),
    location: z
      .string()
      .trim()
      .max(100, "Location must be at most 100 characters.")
      .optional(),
    dateOfBirth: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .refine(
        (val) => {
          if (val === null) return true;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        {
          message: "Invalid date format. Must be a valid date or null.",
        }
      )
      .optional(),
    profilePicture: z
      .string()
      .trim()
      .max(100, "Profile picture must be at most 100 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");
