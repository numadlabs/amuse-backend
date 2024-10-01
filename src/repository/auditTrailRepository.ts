import { Insertable, Kysely, Transaction } from "kysely";
import { AuditTrail, DB } from "../types/db/types";

export const auditTrailRepository = {
  create: async (
    db: Kysely<DB> | Transaction<DB>,
    data: Insertable<AuditTrail>
  ) => {
    const auditTrail = await db
      .insertInto("AuditTrail")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the audit trail.")
      );

    return auditTrail;
  },
};
