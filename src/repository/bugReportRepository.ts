import { Insertable } from "kysely";
import { BugReport } from "../types/db/types";
import { db } from "../utils/db";

export const bugReportRepository = {
  create: async (data: Insertable<BugReport>) => {
    const bugReport = await db
      .insertInto("BugReport")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the bug report.")
      );

    return bugReport;
  },
};
