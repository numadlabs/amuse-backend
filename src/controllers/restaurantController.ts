import { Expression, Insertable, sql } from "kysely";
import { Restaurant } from "../types/db/types";
import { restaurantResposity } from "../repository/restaurantRepository";
import { NextFunction, Request, Response } from "express";
import { db } from "../utils/db";
import { CATEGORY } from "../types/db/enums";

export const restaurantController = {
  //opens ex: 00:15, closes ex: 24:15 baih
  //edge case: opens 09:00, closes 00:15
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
  //opensAt, closesAt dr joohon ajillah hereg bna
  getRestaurant: async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const distance = Number(req.query.distance) || 5000;
    const offset = (page - 1) * limit;

    let search = req.query.search;

    const { latitude, longitude } = req.body;
    const categories: CATEGORY[] = req.body.categories || null;
    const time: string = req.body.time;

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
      query = query
        .where((eb) =>
          eb(sql`CAST(${eb.ref("Restaurant.opensAt")} as time)`, "<=", time)
        )
        .where(
          (eb) => sql`CAST(${eb.ref("Restaurant.closesAt")} as time) > ${time}`
        );
    }

    query = query.offset(offset).limit(limit);

    const restaurants = await query.execute();

    return res
      .status(200)
      .json({ success: true, data: { restaurants: restaurants } });
  },
};

function dateBuilder(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export function to_tsvector(expr: Expression<string> | string) {
  return sql`to_tsvector(${sql.lit("english")}, ${expr})`;
}

export function to_tsquery(expr: Expression<string> | string) {
  return sql`to_tsquery(${sql.lit("english")}, ${expr} || ':*')`;
}
