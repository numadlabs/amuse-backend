import { z } from "zod";

export const createTimetableSchema = z
  .object({
    dayNoOfTheWeek: z
      .number()
      .int()
      .positive("Day number of the week must be a positive number."),
    opensAt: z.string().trim().time("Invalid time format.").optional(),
    closesAt: z.string().trim().time("Invalid time format.").optional(),
    isOffDay: z.boolean().optional(),
    restaurantId: z.string().trim().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateTimetableSchema = z
  .object({
    dayNoOfTheWeek: z
      .number()
      .int()
      .positive("Day number of the week must be positive number.")
      .optional(),
    opensAt: z.string().trim().time("Invalid time format.").optional(),
    closesAt: z.string().trim().time("Invalid time format.").optional(),
    isOffDay: z.boolean().optional(),
  })
  .strict("Unexpected field detected.");
