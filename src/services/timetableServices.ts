import { Updateable } from "kysely";
import { Timetable } from "../types/db/types";
import { timetableRepository } from "../repository/timetableRepository";
import { CustomError } from "../exceptions/CustomError";

export const timetableServices = {
  update: async (data: Updateable<Timetable>, id: string) => {
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

    const updatedTimetable = await timetableRepository.update(data, id);

    return updatedTimetable;
  },
};
