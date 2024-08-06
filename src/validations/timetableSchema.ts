import { z } from "zod";

export const createTimetableSchema = z
  .object({
    dayNoOfTheWeek: z.number().int().positive(),
    opensAt: z.string().time(),
    closesAt: z.string().time(),
    isOffDay: z.boolean(),
    restaurantId: z.string().uuid(),
  })
  .strict("Unexpected field detected.");

export const updateTimetableSchema = z
  .object({
    dayNoOfTheWeek: z.number().int().positive().optional(),
    opensAt: z.string().time().optional(),
    closesAt: z.string().time().optional(),
    isOffDay: z.boolean().optional(),
  })
  .strict("Unexpected field detected.");
