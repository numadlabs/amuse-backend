import { Insertable, Updateable, sql } from "kysely";
import { Restaurant } from "../types/db/types";
import { restaurantRepository } from "../repository/restaurantRepository";
import { NextFunction, Request, Response } from "express";
import { db } from "../utils/db";
import { CATEGORY } from "../types/db/enums";
import { to_tsquery, to_tsvector } from "../lib/queryHelper";
import { restaurantServices } from "../services/restaurantServices";
import { AuthenticatedRequest } from "../../custom";

export const restaurantController = {
  createRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Restaurant> = { ...req.body };
    const file = req.file as Express.Multer.File;

    try {
      const restaurant = await restaurantServices.create(data, file);

      return res
        .status(200)
        .json({ success: true, data: { restaurant: restaurant } });
    } catch (e) {
      next(e);
    }
  },
  updateRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data: Updateable<Restaurant> = { ...req.body };
    const file = req.file as Express.Multer.File;

    try {
      if (data.id) throw new Error("You cannot change id.");

      const restaurant = await restaurantServices.update(id, data, file);

      return res.status(200).json({ success: true, restaurant: restaurant });
    } catch (e) {
      next(e);
    }
  },
  deleteRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
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
    if (!req.user?.id)
      return res
        .status(401)
        .json({ success: false, data: null, error: "Unauthenticated." });

    let userId: string = req.user.id;

    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      //const distance = Number(req.query.distance) || 5000;
      const offset = (page - 1) * limit;
      let search = req.query.search;

      const categories = req.query.categories;
      const { latitude, longitude, time, dayNoOfTheWeek } = req.query;

      if (!time || !dayNoOfTheWeek)
        return res.status(401).json({
          success: false,
          data: null,
          error: "Please provide the local time/dayNo.",
        });

      const dayNo = Number(dayNoOfTheWeek);
      if (dayNo < 1 || dayNo > 7)
        return res.status(401).json({
          success: false,
          data: null,
          error: "Please valid dayNoOfTheWeek.",
        });

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
        .leftJoin(
          "UserCard",
          (join) =>
            join
              .on("Card.id", "=", "UserCard.cardId")
              .on("UserCard.userId", "=", userId) // Move the userId condition here
        )
        .select(({ eb }) => [
          "r.id",
          "r.name",
          "r.description",
          "r.category",
          "r.location",
          "r.latitude",
          "r.longitude",
          "r.logo",
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
                      AND t."dayNoOfTheWeek" = ${dayNo}
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
        .orderBy("r.name", "asc"); // Fix the orderBy syntax

      if (categories) {
        const parsedCategories: CATEGORY[] = JSON.parse(categories.toString());
        query = query.where("r.category", "in", parsedCategories);
      }

      // if (search) {
      //   query = query.where((eb) =>
      //     eb(to_tsvector(eb.ref("r.name")), "@@", to_tsquery(`${search}`))
      //   );
      // }

      query = query.offset(offset).limit(limit);
      let restaurants = await query.execute();

      return res
        .status(200)
        .json({ success: true, data: { restaurants: restaurants } });
    } catch (e) {
      next(e);
    }
  },
  getRestaurantById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Could not retrieve data from the token.",
      });

    try {
      const restaurant = await restaurantRepository.getByIdWithCardInfo(
        id,
        req.user.id
      );

      return res.status(200).json({ success: true, restaurant: restaurant });
    } catch (e) {
      next(e);
    }
  },
};
