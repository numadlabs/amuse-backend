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
exports.restaurantRepository = void 0;
const db_1 = require("../utils/db");
exports.restaurantRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield db_1.db
            .insertInto("Restaurant")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not create the restaurant."));
        return restaurant;
    }),
    getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield db_1.db
            .selectFrom("Restaurant")
            .where("Restaurant.id", "=", id)
            .selectAll()
            .executeTakeFirstOrThrow(() => new Error("Restaurant does not exists"));
        return restaurant;
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield db_1.db
            .updateTable("Restaurant")
            .where("Restaurant.id", "=", id)
            .set(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not update the restaurant."));
        return restaurant;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield db_1.db
            .deleteFrom("Restaurant")
            .where("Restaurant.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not delete the restaurant."));
        return restaurant;
    }),
};
