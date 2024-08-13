import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";
import { Expo } from "expo-server-sdk";
import { userRepository } from "../repository/userRepository";

export const deviceServices = {
  create: async (data: Insertable<Device>, userId: string) => {
    const isExists = await deviceRepository.getByPushToken(data.pushToken);
    if (isExists)
      throw new CustomError(
        "This device has already been registered for the push notifications.",
        400
      );

    if (!Expo.isExpoPushToken(data.pushToken)) {
      throw new CustomError("Provided is not valid expopushtoken.", 400);
    }

    const user = await userRepository.getUserById(userId);
    if (!user) throw new CustomError("User does not exists.", 400);
    data.userId = user.id;

    const device = await deviceRepository.create(data);

    return device;
  },
};
