import { z } from "zod";
import { TRANSACTION_TYPE } from "../types/db/enums";

export const createTransactionSchema = z
  .object({
    type: z.nativeEnum(TRANSACTION_TYPE, {
      message: "Invalid transaction type.",
    }),
    txid: z
      .string()
      .trim()
      .min(5, "The transaction id must be at least 5 characters.")
      .max(255, "The transaction id must be at most 255 characters."),
    amount: z.number().positive("The amount must be a positive number."),
    restaurantId: z.string().trim().uuid().optional(),
    userId: z.string().trim().uuid().optional(),
  })
  .strict("Unexpected field detected.");
