import { Insertable, Updateable } from "kysely";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { Restaurant, Timetable } from "../types/db/types";
import { s3 } from "../utils/aws";
import { s3BucketName } from "../lib/constants";
import { randomUUID } from "crypto";
import { cardRepository } from "../repository/cardRepository";
import { timetableRepository } from "../repository/timetableRepository";
import { encryptionHelper } from "../lib/encryptionHelper";
import { employeeRepository } from "../repository/employeeRepository";
import { parseLatLong } from "../lib/locationParser";

export const restaurantServices = {
  create: async (
    data: Insertable<Restaurant>,
    file: Express.Multer.File,
    ownerId: string,
    googleMapsUrl: string
  ) => {
    const owner = await employeeRepository.getById(ownerId);
    if (!owner) throw new CustomError("Owner not found.", 400);

    const { latitude, longitude } = parseLatLong(googleMapsUrl);
    if (!latitude || !longitude)
      throw new CustomError("Error parsing the latitude and longitude.", 400);

    data.latitude = latitude;
    data.longitude = longitude;

    const restaurant = await restaurantRepository.create(data);

    let updatedRestaurant = restaurant;
    if (file) {
      const randomKey = randomUUID();
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: `restaurant/${randomKey}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      restaurant.logo = randomKey;
      updatedRestaurant = await restaurantRepository.update(
        restaurant.id,
        restaurant
      );
    }

    const timetable: Insertable<Timetable>[] = [
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 1,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 2,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 3,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 4,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 5,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 6,
        opensAt: "10:00",
        closesAt: "22:00",
      },
      {
        restaurantId: restaurant.id,
        dayNoOfTheWeek: 7,
        isOffDay: true,
      },
    ];

    await timetableRepository.create(timetable);
    await employeeRepository.update({ restaurantId: restaurant.id }, ownerId);

    return updatedRestaurant;
  },
  update: async (
    id: string,
    data: Updateable<Restaurant>,
    file: Express.Multer.File,
    googleMapsUrl: string
  ) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);
    if (data.balance || data.logo)
      throw new CustomError("Invalid data given.", 400);

    if (googleMapsUrl) {
      const { latitude, longitude } = parseLatLong(googleMapsUrl);
      if (!latitude || !longitude)
        throw new CustomError("Error parsing the latitude and longitude.", 400);
      data.latitude = latitude;
      data.longitude = longitude;
    }

    if (file && restaurant.logo) {
      await s3
        .deleteObject({
          Bucket: s3BucketName,
          Key: `restaurant/${restaurant.logo}`,
        })
        .promise();
    }

    if (file) {
      const randomKey = randomUUID();
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: `restaurant/${randomKey}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      data.logo = randomKey;
    }

    const updatedRestaurant = await restaurantRepository.update(
      restaurant.id,
      data
    );

    return updatedRestaurant;
  },
  delete: async (id: string) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    const deletedRestaurant = await restaurantRepository.delete(restaurant.id);

    return deletedRestaurant;
  },
  generateNFC: async (restaurantId: string) => {
    const restaurant = await restaurantRepository.getById(restaurantId);

    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const data = {
      restaurantId: restaurant.id,
    };

    const hashedData = encryptionHelper.encryptData(JSON.stringify(data));

    return hashedData;
  },
  updateRewardDetail: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    if (data.rewardAmount && data.rewardAmount <= 0)
      throw new CustomError("Invalid rewardAmount.", 400);

    if (data.perkOccurence && data.perkOccurence < 1)
      throw new CustomError("Invalid perkOccurence.", 400);

    const updatedRestaurant = await restaurantRepository.update(
      restaurant.id,
      data
    );

    return updatedRestaurant;
  },
};
