import { Insertable, Kysely, Updateable, Transaction } from "kysely";
import { DB, Product } from "../types/db/types";
import { db } from "../utils/db";

export const productRepository = {
  create: async (data: Insertable<Product>) => {
    const product = await db
      .insertInto("Product")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(() => new Error("Could not create a product."));

    return product;
  },
  update: async (id: string, data: Updateable<Product>) => {
    const product = await db
      .updateTable("Product")
      .set(data)
      .where("Product.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the product.")
      );

    return product;
  },
  delete: async (id: string) => {
    const deletedProduct = await db
      .deleteFrom("Product")
      .where("Product.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the product.")
      );

    return deletedProduct;
  },
  getById: async (id: string) => {
    const product = await db
      .selectFrom("Product")
      .where("Product.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return product;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const products = await db
      .selectFrom("Product")
      .where("Product.restaurantId", "=", restaurantId)
      .selectAll()
      .execute();

    return products;
  },
  getByProductCategoryId: async (productCategoryId: string) => {
    const products = await db
      .selectFrom("Product")
      .where("Product.productCategoryId", "=", productCategoryId)
      .selectAll()
      .execute();

    return products;
  },
  count: async () => {
    const products = await db
      .selectFrom("Product")
      .select(({ fn }) => [fn.count<number>("Product.id").as("count")])
      .executeTakeFirstOrThrow(() => new Error("Couldn't count the products."));

    return products;
  },
};
