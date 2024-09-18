import { Insertable } from "kysely";
import { BugReport } from "../types/db/types";
import { userRepository } from "../repository/userRepository";
import { CustomError } from "../exceptions/CustomError";
import { bugReportRepository } from "../repository/bugReportRepository";

export const bugReportServices = {
  create: async (data: Insertable<BugReport>, issuerId: string) => {
    data.userId = "issuerId";
    const bugReport = await bugReportRepository.create(data);

    return bugReport;
  },
};
