import { z } from "zod";

export const createProductCategorySchema = z
  .object({
    name: z
      .string({ message: "The name must be a string." })
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(255, "The name must contain at most 255 characters.")
      .transform((val) => val.toUpperCase()),
  })
  .strict("Unexpected field detected.");

export const getProductCategoryByNameSchema = z
  .object({
    name: z
      .string({ message: "The name must be a string." })
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(255, "The name must contain at most 255 characters.")
      .transform((val) => val.toUpperCase()),
  })
  .strict("Unexpected field detected.");
