import { Insertable, Kysely, Updateable, Transaction } from "kysely";
import { DB, ProductCategory } from "../types/db/types";
import { db } from "../utils/db";

export const productCategoryRepository = {
  create: async (data: Insertable<ProductCategory>) => {
    const productCategory = await db
      .insertInto("ProductCategory")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create a product category.")
      );

    return productCategory;
  },
  update: async (id: string, data: Updateable<ProductCategory>) => {
    const productCategory = await db
      .updateTable("ProductCategory")
      .set(data)
      .where("ProductCategory.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the product category.")
      );

    return productCategory;
  },
  delete: async (id: string) => {
    const deletedProductCategory = await db
      .deleteFrom("ProductCategory")
      .where("ProductCategory.id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not delete the product category.")
      );

    return deletedProductCategory;
  },
  getById: async (id: string) => {
    const productCategory = await db
      .selectFrom("ProductCategory")
      .where("ProductCategory.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return productCategory;
  },
  getByName: async (name: string) => {
    const productCategory = await db
      .selectFrom("ProductCategory")
      .where("ProductCategory.name", "=", name)
      .selectAll()
      .executeTakeFirst();

    return productCategory;
  },
  getAll: async () => {
    const productCategories = await db
      .selectFrom("ProductCategory")
      .selectAll()
      .execute();

    return productCategories;
  },
};
