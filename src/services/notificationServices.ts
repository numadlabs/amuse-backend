import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import logger from "../config/winston";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { db } from "../utils/db";
import { deviceRepository } from "../repository/deviceRepository";
import { CustomError } from "../exceptions/CustomError";

export const notificationServices = {
  send: async (message: string, issuerId: string) => {
    const devices = await deviceRepository.get();
    if (devices.length === 0) throw new CustomError("No devices found.", 400);

    const expo = new Expo();

    let messages: ExpoPushMessage[] = [];
    for (let device of devices) {
      const pushToken = device.pushToken;
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.info(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: "default",
        body: message,
        data: { withSome: "data" },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        logger.info(`Push notification ticket chunk: ${ticketChunk}`);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error(`Error sending push notification: ${error}`);
      }
    }

    await auditTrailRepository.create(db, {
      operation: "PUSH_NOTIFICATION",
      data: message,
      updatedEmployeeId: issuerId,
    });

    return tickets;
  },
};
