import { Insertable, Updateable } from "kysely";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { Restaurant, Timetable } from "../types/db/types";
import { deleteFromS3, s3, uploadToS3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { timetableRepository } from "../repository/timetableRepository";
import { employeeRepository } from "../repository/employeeRepository";
import { parseLatLong } from "../lib/locationParser";
import { db } from "../utils/db";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { parseChangedFieldsFromObject } from "../lib/parseChangedFieldsFromObject";
import { categoryRepository } from "../repository/categoryRepository";
import { employeeServices } from "./employeeServices";

export const restaurantServices = {
  create: async (
    data: Insertable<Restaurant>,
    file: Express.Multer.File,
    ownerId: string
  ) => {
    const owner = await employeeRepository.getById(ownerId);
    if (!owner) throw new CustomError("Owner not found.", 400);
    if (owner.restaurantId)
      throw new CustomError("You are not allowed to create restaurant.", 400);

    if (!data.googleMapsUrl)
      throw new CustomError("Please provide an google maps url.", 400);
    const { latitude, longitude } = parseLatLong(data.googleMapsUrl);
    if (!latitude || !longitude)
      throw new CustomError("Error parsing the latitude and longitude.", 400);

    if (!data.categoryId)
      throw new CustomError("Please provide a category.", 400);
    const category = await categoryRepository.getById(data.categoryId);
    if (!category) throw new CustomError("Invalid category.", 400);

    data.latitude = latitude;
    data.longitude = longitude;

    const restaurant = await restaurantRepository.create(data);

    let updatedRestaurant = restaurant;
    if (file) {
      const randomKey = randomUUID();
      await uploadToS3(`restaurant/${randomKey}`, file);

      restaurant.logo = randomKey;
      updatedRestaurant = await restaurantRepository.update(
        db,
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
    await employeeRepository.update(ownerId, { restaurantId: restaurant.id });
    await auditTrailRepository.create(db, {
      tableName: "RESTAURANT",
      operation: "INSERT",
      data: updatedRestaurant,
      updatedEmployeeId: owner.id,
    });

    return updatedRestaurant;
  },
  update: async (
    id: string,
    data: Updateable<Restaurant>,
    file: Express.Multer.File,
    issuerId: string
  ) => {
    const restaurant = await restaurantRepository.getById(db, id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      restaurant.id
    );

    if (data.googleMapsUrl) {
      const { latitude, longitude } = parseLatLong(data.googleMapsUrl);
      if (!latitude || !longitude)
        throw new CustomError("Error parsing the latitude and longitude.", 400);
      data.latitude = latitude;
      data.longitude = longitude;
    }

    const result = await db.transaction().execute(async (trx) => {
      if (file && restaurant.logo) {
        await deleteFromS3(`restaurant/${restaurant.logo}`);
      }

      if (file) {
        const randomKey = randomUUID();
        await uploadToS3(`restaurant/${randomKey}`, file);

        data.logo = randomKey;
      }

      const updatedRestaurant = await restaurantRepository.update(
        trx,
        restaurant.id,
        data
      );

      const changedData = parseChangedFieldsFromObject(
        restaurant,
        updatedRestaurant
      );

      await auditTrailRepository.create(trx, {
        tableName: "RESTAURANT",
        operation: "UPDATE",
        data: changedData,
        updatedEmployeeId: issuer.id,
      });

      return updatedRestaurant;
    });

    return result;
  },
  delete: async (id: string) => {
    const restaurant = await restaurantRepository.getById(db, id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    if (restaurant.logo) await deleteFromS3(`restaurant/${restaurant.logo}`);

    const deletedRestaurant = await restaurantRepository.delete(restaurant.id);

    return deletedRestaurant;
  },
  updateRewardDetail: async (
    id: string,
    data: Updateable<Restaurant>,
    issuerId: string
  ) => {
    const restaurant = await restaurantRepository.getById(db, id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      restaurant.id
    );

    const updatedRestaurant = await restaurantRepository.update(
      db,
      restaurant.id,
      data
    );

    const changedData = parseChangedFieldsFromObject(
      restaurant,
      updatedRestaurant
    );
    await auditTrailRepository.create(db, {
      tableName: "RESTAURANT",
      operation: "UPDATE",
      data: changedData,
      updatedEmployeeId: issuer.id,
    });

    return updatedRestaurant;
  },
};
