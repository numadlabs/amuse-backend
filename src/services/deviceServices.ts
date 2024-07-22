import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";

export const deviceServices = {
  create: async (data: Insertable<Device>) => {
    const isExists = await deviceRepository.getByPushToken(data.pushToken);
    if (isExists)
      throw new CustomError(
        "This device has already been registered for the push notifications.",
        400
      );

    const device = await deviceRepository.create(data);

    return device;
  },
};
