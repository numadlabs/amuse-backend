import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(255, "The name must contain at most 255 characters."),
    price: z
      .string()
      .trim()
      .transform((val) => Number(val))
      .pipe(
        z
          .number({ message: "The price must be a positive number." })
          .min(0, "The price must be greater than or equal to 0.")
          .positive("The price must be a positive number.")
      ),
    description: z
      .string({ message: "The description must be a string." })
      .trim()
      .max(512, "The description must contain at most 512 characters."),
    productCategoryId: z
      .string({ message: "The category id must be a string." })
      .trim()
      .uuid({ message: "The category id must be a valid UUID." })
      .optional(),
    status: z.enum(["AVAILABLE", "SOLD_OUT", "INCOMING"]).optional(),
  })
  .strict("Unexpected field detected.");

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "The name must contain at least 1 character.")
      .max(255, "The name must contain at most 255 characters.")
      .optional(),
    price: z
      .string()
      .trim()
      .transform((val) => Number(val))
      .pipe(
        z
          .number({ message: "The price must be a positive number." })
          .min(0, "The price must be greater than or equal to 0.")
          .positive("The price must be a positive number.")
      )
      .optional(),
    description: z
      .string({ message: "The description must be a string." })
      .trim()
      .max(512, "The description must contain at most 512 characters.")
      .optional(),
    productCategoryId: z
      .string({ message: "The category id must be a string." })
      .trim()
      .uuid({ message: "The category id must be a valid UUID." })
      .optional(),
    status: z.enum(["AVAILABLE", "SOLD_OUT", "INCOMING"]).optional(),
  })
  .strict("Unexpected field detected.");
