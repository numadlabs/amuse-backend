"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantController = void 0;
const kysely_1 = require("kysely");
const restaurantRepository_1 = require("../repository/restaurantRepository");
const db_1 = require("../utils/db");
const queryHelper_1 = require("../lib/queryHelper");
const restaurantServices_1 = require("../services/restaurantServices");
exports.restaurantController = {
    createRestaurant: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        const file = req.file;
        try {
            const restaurant = yield restaurantServices_1.restaurantServices.create(data, file);
            return res
                .status(200)
                .json({ success: true, data: { restaurant: restaurant } });
        }
        catch (e) {
            next(e);
        }
    }),
    updateRestaurant: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const data = Object.assign({}, req.body);
        const file = req.file;
        try {
            if (data.id)
                throw new Error("You cannot change id.");
            const restaurant = yield restaurantServices_1.restaurantServices.update(id, data, file);
            return res.status(200).json({ success: true, restaurant: restaurant });
        }
        catch (e) {
            next(e);
        }
    }),
    deleteRestaurant: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const restaurant = yield restaurantServices_1.restaurantServices.delete(id);
            return res.status(200).json({ success: true, restaurant: restaurant });
        }
        catch (e) {
            next(e);
        }
    }),
    getRestaurants: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res
                .status(401)
                .json({ success: false, data: null, error: "Unauthenticated." });
        let userId = req.user.id;
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            /* const distance = Number(req.query.distance) || 5000; */
            const offset = (page - 1) * limit;
            //optional -> page, limit, distance??, search   categories, time
            //must     -> latitude, longitude
            let search = req.query.search;
            const categories = req.query.categories;
            const { latitude, longitude, time } = req.query;
            /* if (!latitude && !longitude)
              return res.status(400).json({
                success: false,
                data: null,
                error: "Please provide your address",
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
            let query = db_1.db
                .selectFrom("Restaurant")
                .innerJoin("Card", "Card.restaurantId", "Restaurant.id")
                .leftJoin("UserCard", "UserCard.cardId", "Card.id")
                .select(({ eb }) => [
                "Restaurant.id",
                "Restaurant.name",
                "Restaurant.description",
                "Restaurant.category",
                "Restaurant.location",
                "Restaurant.latitude",
                "Restaurant.longitude",
                "Restaurant.opensAt",
                "Restaurant.closesAt",
                "Restaurant.logo",
                "Card.id as cardId",
                "Card.benefits",
                "Card.artistInfo",
                "Card.expiryInfo",
                "Card.instruction",
                "Card.nftImageUrl",
                db_1.db
                    .selectFrom("UserCard")
                    .select(({ eb, fn }) => [
                    eb(fn.count("UserCard.id"), ">", 0).as("count"),
                ])
                    .where("UserCard.cardId", "=", eb.ref("Card.id"))
                    .where("UserCard.userId", "=", userId)
                    .as("isOwned"),
                "UserCard.visitCount",
            ])
                .orderBy("Restaurant.name asc");
            if (categories) {
                const parsedCategories = JSON.parse(categories.toString());
                query = query.where("Restaurant.category", "in", parsedCategories);
            }
            if (search) {
                query = query.where((eb) => eb((0, queryHelper_1.to_tsvector)(eb.ref("Restaurant.name")), "@@", (0, queryHelper_1.to_tsquery)(`${search}`)));
            }
            if (time) {
                query = query.where((eb) => (0, kysely_1.sql) `(case
          when ((cast(${eb.ref("Restaurant.closesAt")} as time) < cast(${eb.ref("Restaurant.opensAt")}  as time)) and ((${time} > cast(${eb.ref("Restaurant.closesAt")} as time)) and (${time} < cast(${eb.ref("Restaurant.opensAt")} as time)))) then false
          when ((cast(${eb.ref("Restaurant.closesAt")} as time) > cast(${eb.ref("Restaurant.opensAt")}  as time)) and ((${time} > cast(${eb.ref("Restaurant.closesAt")} as time)) or (${time} < cast(${eb.ref("Restaurant.opensAt")} as time)))) then false
          else true
        end)`);
            }
            query = query.offset(offset).limit(limit);
            const restaurants = yield query.execute();
            return res
                .status(200)
                .json({ success: true, data: { restaurants: restaurants } });
        }
        catch (e) {
            next(e);
        }
    }),
    getRestaurantById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const restaurant = yield restaurantRepository_1.restaurantRepository.getById(id);
            return res.status(200).json({ success: true, restaurant: restaurant });
        }
        catch (e) {
            next(e);
        }
    }),
};
