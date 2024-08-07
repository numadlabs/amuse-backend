import { z } from "zod";
import { BONUS_TYPE } from "../types/db/enums";

export const createBonusSchema = z
  .object({
    name: z.string(),
    type: z.nativeEnum(BONUS_TYPE),
    totalSupply: z.number().int().positive(),
    cardId: z.string().uuid(),
    price: z.number().positive().optional(),
    visitNo: z.number().int().positive().optional(),
  })
  .strict("Unexpected field detected.");

export const updateBonusSchema = z
  .object({
    name: z.string().optional(),
    totalSupply: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    visitNo: z.number().int().positive().optional(),
  })
  .strict("Unexpected field detected.");
