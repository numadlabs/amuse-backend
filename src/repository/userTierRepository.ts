import { db } from "../utils/db";

export const userTierRepository = {
  getStartingTier: async () => {
    const tier = await db
      .selectFrom("UserTier")
      .selectAll()
      .where("UserTier.requiredNo", "=", 0)
      .executeTakeFirstOrThrow(
        () => new Error("Could not fetch the starting tier info.")
      );

    return tier;
  },
  getById: async (id: string) => {
    const tier = await db
      .selectFrom("UserTier")
      .selectAll()
      .where("UserTier.id", "=", id)
      .executeTakeFirst();

    return tier;
  },
  getByIdWithNextTier: async (id: string) => {
    const tier = await db
      .selectFrom("UserTier as ut")
      .leftJoin("UserTier as ut2", "ut.nextTierId", "ut2.id")
      .select([
        "ut.id",
        "ut.name",
        "ut.rewardMultiplier",
        "ut.requiredNo",
        "ut.nextTierId",
        "ut2.requiredNo as nextTierNo",
      ])
      .where("ut.id", "=", id)
      .executeTakeFirstOrThrow(() => new Error("UserTier not found."));

    return tier;
  },
  get: async () => {
    const tier = await db.selectFrom("UserTier").selectAll().execute();

    return tier;
  },
};
