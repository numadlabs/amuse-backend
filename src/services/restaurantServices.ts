import { Insertable, Updateable } from "kysely";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { Restaurant, Timetable } from "../types/db/types";
import { s3 } from "../utils/aws";
import { s3BucketName } from "../lib/constants";
import { randomUUID } from "crypto";
import { cardRepository } from "../repository/cardRepository";
import { timetableRepository } from "../repository/timetableRepository";

export const restaurantServices = {
  create: async (data: Insertable<Restaurant>, file: Express.Multer.File) => {
    const restaurant = await restaurantRepository.create(data);

    if (!file) return restaurant;

    const s3Response = await s3
      .upload({
        Bucket: s3BucketName,
        Key: randomUUID(),
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    restaurant.logo = s3Response.Key;
    const updatedRestaurant = await restaurantRepository.update(
      restaurant.id,
      restaurant
    );

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

    return updatedRestaurant;
  },
  update: async (
    id: string,
    data: Updateable<Restaurant>,
    file: Express.Multer.File
  ) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);
    if (
      data.balance ||
      data.logo ||
      (data.perkOccurence && data.perkOccurence < 1) ||
      (data.rewardAmount && data.rewardAmount <= 0)
    )
      throw new CustomError("Invalid data given.", 400);

    if (file && restaurant.logo) {
      await s3
        .deleteObject({ Bucket: s3BucketName, Key: restaurant.logo })
        .promise();
    }

    if (file) {
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: randomUUID(),
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      data.logo = s3Response.Key;
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
};
