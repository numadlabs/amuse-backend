import { Insertable } from "kysely";
import { Device } from "../types/db/types";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

export const notificationServices = {
  send: async (devices: Insertable<Device>[], message: string) => {
    const expo = new Expo();

    let messages: ExpoPushMessage[] = [];
    for (let device of devices) {
      const pushToken = device.pushToken;
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
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
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    return tickets;
  },
};
