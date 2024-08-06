import { number, string, z, date } from "zod";
import { BONUS_TYPE, ROLES } from "../types/db/enums";

export const idSchema = z
  .object({ id: z.string().uuid() })
  .strict("Unexpected field detected.");
export const userIdSchema = z
  .object({ userId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const userCardIdSchema = z
  .object({ userCardId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const restaurantIdSchema = z
  .object({ restaurantId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const bonusIdSchema = z
  .object({ bonusId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const cardIdSchema = z
  .object({ cardId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const userTierIdSchema = z
  .object({ userTierId: z.string().uuid() })
  .strict("Unexpected field detected.");
export const bonusTypeSchema = z
  .object({ type: z.nativeEnum(BONUS_TYPE) })
  .strict("Unexpected field detected.");
export const roleSchema = z
  .object({ role: z.nativeEnum(ROLES) })
  .strict("Unexpected field detected.");

export const paginationSchema = z
  .object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0, {
        message: "page must be a positive number",
      })
      .optional(),
    pageSize: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0, {
        message: "pageSize must be a positive number",
      })
      .optional(),
  })
  .strict("Unexpected field detected.");

export const dashboardSchema = z
  .object({
    location: z.string().min(1).max(30).optional(),
    dayNo: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0, {
        message: "pageSize must be a positive number",
      })
      .optional(),
  })
  .strict("Unexpected field detected.");

export const timeSchema = z
  .object({
    time: z.string().time(),
    dayNoOfTheWeek: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0 && val <= 7, {
        message: "pageSize must be a positive number",
      }),
  })
  .strict("Unexpected field detected.");

export const queryFilterSchema = z
  .object({
    longitude: z.string().regex(/^\d+$/).transform(Number).optional(),
    latitude: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().min(1).max(30).optional(),
  })
  .strict("Unexpected field detected.");

export const encryptedDataSchema = z
  .object({
    encryptedData: z.string().min(1).max(255),
  })
  .strict("Unexpected field detected.");
