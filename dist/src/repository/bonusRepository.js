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
exports.bonusRepository = void 0;
const db_1 = require("../utils/db");
const CustomError_1 = require("../exceptions/CustomError");
exports.bonusRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .insertInto("Bonus")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't create the bonus."));
        return bonus;
    }),
    update: (data, id) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .updateTable("Bonus")
            .where("Bonus.id", "=", id)
            .set(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't update the bonus."));
        return bonus;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .deleteFrom("Bonus")
            .where("Bonus.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't delete the bonus."));
        return bonus;
    }),
    getByCardId: (cardId) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .selectFrom("Bonus")
            .where("Bonus.cardId", "=", cardId)
            .selectAll()
            .execute();
        return bonus;
    }),
    getByRestaurantId: (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .selectFrom("Bonus")
            .innerJoin("Card", "Card.id", "Bonus.cardId")
            .innerJoin("Restaurant", "Restaurant.id", "Card.id")
            .where("Restaurant.id", "=", restaurantId)
            .select(["Bonus.id", "Bonus.cardId", "Bonus.name", "Bonus.imageUrl"])
            .execute();
        return bonus;
    }),
    getFirstTapBonus: () => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .selectFrom("Bonus")
            /* .where("Bonus.cardId", "=", null) */
            .where("Bonus.name", "=", "Free Drink")
            .selectAll()
            .executeTakeFirstOrThrow(() => new CustomError_1.CustomError("No Global free drink bonus found.", 500));
        return bonus;
    }),
    getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const bonus = yield db_1.db
            .selectFrom("Bonus")
            .where("Bonus.id", "=", id)
            .selectAll()
            .executeTakeFirst();
        return bonus;
    }),
};
