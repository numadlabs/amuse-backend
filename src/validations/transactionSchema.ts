import { z } from "zod";
import { TRANSACTION_TYPE } from "../types/db/enums";

export const createTransactionSchema = z
  .object({
    type: z.nativeEnum(TRANSACTION_TYPE),
    txid: z.string().min(5).max(255),
    amount: z.number().positive(),
    restaurantId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  })
  .strict("Unexpected field detected.");
