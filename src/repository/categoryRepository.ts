import { Insertable } from "kysely";
import { Category } from "../types/db/types";
import { db } from "../utils/db";

export const categoryRepository = {
  create: async (data: Insertable<Category>) => {
    const category = await db
      .insertInto("Category")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the category.")
      );

    return category;
  },
  get: async () => {
    const categories = await db.selectFrom("Category").selectAll().execute();

    return categories;
  },
  getById: async (id: string) => {
    const category = await db
      .selectFrom("Category")
      .selectAll()
      .where("Category.id", "=", id)
      .executeTakeFirst();

    return category;
  },
};
