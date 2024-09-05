import { db } from "../utils/db";

export const countryRepository = {
  getById: async (id: string) => {
    const country = await db
      .selectFrom("Country")
      .selectAll()
      .where("Country.id", "=", id)
      .executeTakeFirst();

    return country;
  },
  get: async () => {
    const countries = await db.selectFrom("Country").selectAll().execute();

    return countries;
  },
};
