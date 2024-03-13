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
exports.cardRepository = void 0;
const db_1 = require("../utils/db");
exports.cardRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const card = yield db_1.db
            .insertInto("Card")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't create the card."));
        return card;
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const card = db_1.db
            .updateTable("Card")
            .set(data)
            .where("Card.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't update the card."));
        return card;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const card = db_1.db
            .deleteFrom("Card")
            .where("Card.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't delete the card."));
        return card;
    }),
    getByRestaurantId: (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
        const cards = yield db_1.db
            .selectFrom("Card")
            .where("Card.restaurantId", "=", restaurantId)
            .selectAll()
            .execute();
        return cards;
    }),
    getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const card = yield db_1.db
            .selectFrom("Card")
            .where("Card.id", "=", id)
            .selectAll()
            .executeTakeFirstOrThrow(() => new Error("Card with given id does not exist."));
        return card;
    }),
    get: (offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
        const cards = yield db_1.db
            .selectFrom("Card")
            .selectAll()
            .offset(offset)
            .limit(limit)
            .execute();
        return cards;
    }),
};
