import { z } from "zod";

export const createOrderSchema = z.object({
  orderItems: z
    .array(
      z
        .object({
          productId: z
            .string({ message: "ProductId must be a string." })
            .trim()
            .uuid("Invalid uuid."),
          quantity: z
            .number({ message: "Quantity must be a number." })
            .int()
            .positive("Quantity must be a positive number."),
        })
        .strict("Unexpected field detected.")
    )
    .nonempty(),
});

export const orderIdSchema = z.object({
  orderId: z
    .string({ message: "Id must be a string." })
    .trim()
    .uuid("Invalid uuid."),
});
