import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";
import { Expo } from "expo-server-sdk";

export const deviceServices = {
  create: async (data: Insertable<Device>) => {
    if (!Expo.isExpoPushToken(data.pushToken)) {
      throw new CustomError("Provided is not valid expopushtoken.", 400);
    }

    const isExists = await deviceRepository.getByPushToken(data.pushToken);
    if (isExists) return true;

    const device = await deviceRepository.create(data);

    return device;
  },
};
