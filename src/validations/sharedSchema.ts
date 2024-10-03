import { z } from "zod";
import { BONUS_TYPE, ROLES } from "../types/db/enums";

export const idSchema = z
  .object({ id: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const userIdSchema = z
  .object({ userId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const userCardIdSchema = z
  .object({ userCardId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const restaurantIdSchema = z
  .object({ restaurantId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const bonusIdSchema = z
  .object({ bonusId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const cardIdSchema = z
  .object({ cardId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const userTierIdSchema = z
  .object({ userTierId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const employeeIdSchema = z
  .object({ employeeId: z.string().trim().uuid() })
  .strict("Unexpected field detected.");

export const bonusTypeSchema = z
  .object(
    { type: z.nativeEnum(BONUS_TYPE) },
    { message: "Invalid bonus type." }
  )
  .strict("Unexpected field detected.");

export const roleSchema = z
  .object({ role: z.nativeEnum(ROLES) }, { message: "Invalid role." })
  .strict("Unexpected field detected.");

export const paginationSchema = z.object({
  page: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0, {
      message: "The page must be a positive number.",
    })
    .optional(),
  limit: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0, {
      message: "The limit must be a positive number.",
    })
    .optional(),
});

export const dashboardSchema = z
  .object({
    location: z
      .string()
      .trim()
      .min(1, "The location must be at least 1 character long.")
      .max(30, "The location must be at most 30 characters long.")
      .optional(),
    dayNo: z
      .string()
      .trim()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0, {
        message: "The day number must be a positive number.",
      })
      .optional(),
  })
  .strict("Unexpected field detected.");

export const timeSchema = z.object({
  time: z.string().trim().time("Invalid time format."),
  dayNoOfTheWeek: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0 && val <= 7, {
      message:
        "The day number of the week must be a higher than or equal to 1 and lower than or equal to 7",
    }),
});

export const queryFilterSchema = z
  .object({
    longitude: z.string().trim().transform(Number).optional(),
    latitude: z.string().trim().transform(Number).optional(),
    search: z
      .string()
      .trim()
      .min(1, "The search parameter must be at least 1 character.")
      .max(50, "The search parameter must be at most 50 characters.")
      .optional(),
  })
  .strict("Unexpected field detected.");

export const encryptedDataSchema = z
  .object({
    encryptedData: z
      .string()
      .trim()
      .min(5, "The encrypted data must be at least 5 characters.")
      .max(255, "The encrypted data must be at most 255 characters."),
  })
  .strict("Unexpected field detected.");

export const rateLimiterEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(6, "The email must be at least 6 characters long.")
    .max(255, "The email can be a maximum of 255 characters long.")
    .email({ message: "Invalid email format." }),
});
