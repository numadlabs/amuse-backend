import { Insertable, Updateable, sql } from "kysely";
import { Restaurant } from "../types/db/types";
import { restaurantRepository } from "../repository/restaurantRepository";
import { NextFunction, Request, Response } from "express";
import { db } from "../utils/db";
import { restaurantServices } from "../services/restaurantServices";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { currencyRepository } from "../repository/currencyRepository";
import {
  createRestaurantSchema,
  rewardSystemSchema,
  updateRestaurantSchema,
} from "../validations/restaurantSchema";
import {
  idSchema,
  paginationSchema,
  timeSchema,
} from "../validations/sharedSchema";

export const restaurantController = {
  createRestaurant: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = createRestaurantSchema.parse(req.body);
      const data: Insertable<Restaurant> = { ...req.body };
      const file = req.file as Express.Multer.File;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const restaurant = await restaurantServices.create(
        data,
        file,
        req.user.id
      );

      return res
        .status(200)
        .json({ success: true, data: { restaurant: restaurant } });
    } catch (e) {
      next(e);
    }
  },
  updateRestaurant: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      req.body = updateRestaurantSchema.parse(req.body);
      const data: Insertable<Restaurant> = { ...req.body };
      const file = req.file as Express.Multer.File;

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const restaurant = await restaurantServices.update(
        id,
        data,
        file,
        req.user.id
      );

      return res
        .status(200)
        .json({ success: true, data: { restaurant: restaurant } });
    } catch (e) {
      next(e);
    }
  },
  deleteRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const restaurant = await restaurantServices.delete(id);

      return res.status(200).json({ success: true, restaurant: restaurant });
    } catch (e) {
      next(e);
    }
  },
  getRestaurants: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);
      let userId: string = req.user.id;

      const inputQuery = paginationSchema.parse(req.query);
      const page = inputQuery.page || 1;
      const pageSize = inputQuery.limit || 20;
      const offset = (page - 1) * pageSize;
      // let search = req.query.search;
      //const distance = Number(req.query.distance) || 5000
      // const categories = req.query.categories;
      // const { latitude, longitude } = req.query;

      const { time, dayNoOfTheWeek } = timeSchema.parse(req.query);

      /* if (!latitude && !longitude)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide your address.",
        }); */

      /* let query = db
        .selectFrom("Restaurant")
        .where(
          (eb) =>
            sql`ST_DWITHIN(ST_MakePoint(${eb.ref(
              "Restaurant.latitude"
            )}, ${eb.ref(
              "Restaurant.longitude"
            )}), ST_MakePoint(${latitude}, ${longitude})::geography, ${distance})`
        )
        .selectAll()
        .orderBy(
          (eb) =>
            sql`ST_Distance(ST_MakePoint(${eb.ref(
              "Restaurant.latitude"
            )}, ${eb.ref(
              "Restaurant.longitude"
            )}), ST_MakePoint(${latitude}, ${longitude})::geography) asc`
        ); */

      let query = db
        .selectFrom("Restaurant as r")
        .innerJoin("Card", "Card.restaurantId", "r.id")
        .leftJoin("UserCard", (join) =>
          join
            .onRef("Card.id", "=", "UserCard.cardId")
            .on("UserCard.userId", "=", userId)
        )
        .innerJoin("Category", "Category.id", "r.categoryId")
        .select(({ eb }) => [
          "r.id",
          "r.name",
          "r.description",
          "r.categoryId",
          "Category.name as categoryName",
          "r.location",
          "r.latitude",
          "r.longitude",
          "r.logo",
          "r.googleMapsUrl",
          "Card.id as cardId",
          "Card.benefits",
          "Card.instruction",
          "Card.nftImageUrl",
          db
            .selectFrom("UserCard")
            .innerJoin("Card", "Card.id", "UserCard.cardId")
            .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
            .select(({ eb, fn }) => [
              eb(fn.count<number>("UserCard.id"), ">", 0).as("count"),
            ])
            .where("Restaurant.id", "=", eb.ref("r.id"))
            .where("UserCard.userId", "=", userId)
            .as("isOwned"),
          sql`
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM "Timetable" t
                    WHERE t."restaurantId" = r."id"
                      AND t."dayNoOfTheWeek" = ${dayNoOfTheWeek}
                      AND (
                          (CAST(t."closesAt" AS TIME) < CAST(t."opensAt" AS TIME)
                          AND CAST(${time} AS TIME) > CAST(t."closesAt" AS TIME)
                          AND CAST(${time} AS TIME) < CAST(t."opensAt" AS TIME))
                        OR 
                          (CAST(t."closesAt" AS TIME) > CAST(t."opensAt" AS TIME)
                          AND CAST(${time} AS TIME) > CAST(t."closesAt" AS TIME))
                          OR (CAST(${time} AS TIME) < CAST(t."opensAt" AS TIME))
                        OR (CAST(t."closesAt" AS TIME) IS NULL OR CAST(t."opensAt" AS TIME) IS NULL OR t."isOffDay" IS TRUE)
                      )
                ) THEN false
                ELSE true
            END
          `.as("isOpen"),
          "UserCard.visitCount",
        ])
        .orderBy("r.name", "asc");

      // if (categories) {
      //   const parsedCategories: CATEGORY[] = JSON.parse(categories.toString());
      //   query = query.where("r.category", "in", parsedCategories);
      // }

      // if (search) {
      //   query = query.where((eb) =>
      //     eb(to_tsvector(eb.ref("r.name")), "@@", to_tsquery(`${search}`))
      //   );
      // }

      query = query.offset(offset).limit(pageSize);

      const [restaurants, totalRestaurants] = await Promise.all([
        query.execute(),
        restaurantRepository.count(),
      ]);

      const totalPages = Math.ceil(totalRestaurants.count / pageSize);

      return res.status(200).json({
        success: true,
        data: {
          restaurants: restaurants,
          totalPages: totalPages,
          currentPage: page,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getRestaurantById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      const { time, dayNoOfTheWeek } = timeSchema.parse(req.query);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);

      const restaurant = await restaurantRepository.getByIdWithCardInfo(
        id,
        req.user.id,
        time,
        dayNoOfTheWeek
      );

      let convertedBalance = null;
      let data;

      if (req.user.role !== "USER") {
        const currencies = await currencyRepository.getByTickerWithBtc("EUR");

        convertedBalance =
          (Math.floor(restaurant.balance * 10 ** 8) / 10 ** 8) *
          currencies.btcPrice *
          currencies.tickerPrice;
        data = {
          restaurant: restaurant,
          convertedBalance: convertedBalance,
        };
      } else {
        const { balance, ...omittedRestaurant } = restaurant;
        data = {
          restaurant: omittedRestaurant,
        };
      }

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (e) {
      next(e);
    }
  },
  updateRewardDetail: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      const data: Updateable<Restaurant> = rewardSystemSchema.parse(req.body);

      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 400);

      const restaurant = await restaurantServices.updateRewardDetail(
        id,
        data,
        req.user.id
      );

      return res
        .status(200)
        .json({ success: true, data: { restaurant: restaurant } });
    } catch (e) {
      next(e);
    }
  },
};
