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
};
