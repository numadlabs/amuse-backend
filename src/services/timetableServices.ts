import { Updateable } from "kysely";
import { Timetable } from "../types/db/types";
import { timetableRepository } from "../repository/timetableRepository";
import { CustomError } from "../exceptions/CustomError";
import { parseChangedFieldsFromObject } from "../lib/parseChangedFieldsFromObject";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { db } from "../utils/db";
import { employeeServices } from "./employeeServices";

export const timetableServices = {
  update: async (data: Updateable<Timetable>, id: string, issuerId: string) => {
    const timetable = await timetableRepository.getById(id);
    if (!timetable) throw new CustomError("Invalid timetableId.", 400);
    if (timetable.isOffDay) {
      timetable.closesAt = null;
      timetable.opensAt = null;
    }
    if (!timetable.isOffDay && (!timetable.closesAt || !timetable.opensAt))
      throw new CustomError(
        "Please provide valid opensAt/closesAt/isOffDay value.",
        400
      );

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      timetable.restaurantId
    );
    if (!issuer)
      throw new CustomError("You are not allowed to do this action.", 400);

    const updatedTimetable = await timetableRepository.update(data, id);
    const changedData = parseChangedFieldsFromObject(
      timetable,
      updatedTimetable
    );
    await auditTrailRepository.create(db, {
      tableName: "TIMETABLE",
      operation: "UPDATE",
      data: changedData,
      updatedEmployeeId: issuer.id,
    });

    return updatedTimetable;
  },
};
