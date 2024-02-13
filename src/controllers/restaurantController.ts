import { Expression, Insertable, Updateable, sql } from "kysely";
import { Restaurant } from "../types/db/types";
import { restaurantResposity } from "../repository/restaurantRepository";
import { NextFunction, Request, Response } from "express";
import { db } from "../utils/db";
import { CATEGORY } from "../types/db/enums";
import { to_tsquery, to_tsvector } from "../lib/queryHelper";
import { userRepository } from "../repository/userRepository";
import { userServices } from "../services/userServices";
import { restaurantServices } from "../services/restaurantServices";

export const restaurantController = {
  createRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Restaurant> = { ...req.body };
    try {
      const restaurant = await restaurantResposity.create(data);

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

    try {
      if (data.id) throw new Error("You cannot change id.");

      const restaurant = await restaurantServices.update(id, data);

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
  getRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const distance = Number(req.query.distance) || 5000;
      const offset = (page - 1) * limit;

      //optional -> page, limit, distance, search   categories, time
      //must     -> latitude, longitude

      let search = req.query.search;

      const { latitude, longitude } = req.body;
      const categories: CATEGORY[] = req.body.categories || null;
      const time: string = req.body.time || null;

      if (!latitude && !longitude)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide your address",
        });

      let query = db
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
        );

      if (categories) {
        query = query.where("Restaurant.category", "in", categories);
      }

      if (search) {
        query = query.where((eb) =>
          eb(
            to_tsvector(eb.ref("Restaurant.name")),
            "@@",
            to_tsquery(`${search}`)
          )
        );
      }

      if (time) {
        query = query.where(
          (eb) => sql`(case
          when ((cast(${eb.ref("Restaurant.closesAt")} as time) < cast(${eb.ref(
            "Restaurant.opensAt"
          )}  as time)) and ((${time} > cast(${eb.ref(
            "Restaurant.closesAt"
          )} as time)) and (${time} < cast(${eb.ref(
            "Restaurant.opensAt"
          )} as time)))) then false
          when ((cast(${eb.ref("Restaurant.closesAt")} as time) > cast(${eb.ref(
            "Restaurant.opensAt"
          )}  as time)) and ((${time} > cast(${eb.ref(
            "Restaurant.closesAt"
          )} as time)) or (${time} < cast(${eb.ref(
            "Restaurant.opensAt"
          )} as time)))) then false
          else true
        end)`
        );
      }

      query = query.offset(offset).limit(limit);

      const restaurants = await query.execute();

      return res
        .status(200)
        .json({ success: true, data: { restaurants: restaurants } });
    } catch (e) {
      next(e);
    }
  },
  getRestaurantById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      const restaurant = await restaurantResposity.getById(id);

      return res.status(200).json({ success: true, restaurant: restaurant });
    } catch (e) {
      next(e);
    }
  },
};
