import { z } from "zod";
import { TRANSACTION_TYPE } from "../types/db/enums";

export const createTransactionSchema = z
  .object({
    type: z.nativeEnum(TRANSACTION_TYPE),
    txid: z
      .string()
      .trim()
      .min(5, "Transaction id must be at least 5 characters.")
      .max(255, "Transaction id must be at most 255 characters."),
    amount: z.number().positive("Amount must be positive."),
    restaurantId: z.string().trim().uuid().optional(),
    userId: z.string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");
