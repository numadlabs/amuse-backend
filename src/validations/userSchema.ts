import { z } from "zod";

export const updateUserInfoSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .max(30, "The nickname must contain at most 30 characters.")
      .optional(),
    countryId: z
      .string()
      .transform((val) => (val === "" ? null : val))
      .nullable()
      .refine(
        (val) =>
          val === null ||
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            val!
          ),
        {
          message: "Invalid id format.",
        }
      )
      .optional(),
    birthYear: z
      .string()
      .transform((val) => (val === "" ? null : parseInt(val, 10)))
      .nullable()
      .refine(
        (val) =>
          val === null ||
          (typeof val === "number" &&
            val > 1900 &&
            val < new Date().getFullYear()),
        {
          message: "Invalid birth year.",
        }
      )
      .optional(),
    birthMonth: z
      .string()
      .transform((val) => (val === "" ? null : parseInt(val, 10)))
      .nullable()
      .refine(
        (val) =>
          val === null || (typeof val === "number" && val >= 1 && val <= 12),
        {
          message: "Invalid birth month.",
        }
      )
      .optional(),
    profilePicture: z
      .string()
      .trim()
      .max(1, "The profile picture must be at most 1 character long.")
      .optional(),
  })
  .strict("Unexpected field detected.");
