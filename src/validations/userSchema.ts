import { date, number, string, z } from "zod";

export const updateUserInfoSchema = z
  .object({
    nickname: string().min(1).max(30).optional(),
    location: string().min(1).max(30).optional(),
    dateOfBirth: date().min(new Date("1900-01-01")).max(new Date()).optional(),
  })
  .strict("Unexpected field detected.");
