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
exports.userRepository = void 0;
const db_1 = require("../utils/db");
exports.userRepository = {
    getUserByPhoneNumber: (phoneNumber, prefix) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db_1.db
            .selectFrom("User")
            .where("User.telNumber", "=", phoneNumber)
            .where("prefix", "=", prefix)
            .selectAll()
            .executeTakeFirst();
        return user;
    }),
    getUserById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db_1.db
            .selectFrom("User")
            .where("User.id", "=", id)
            .selectAll()
            .executeTakeFirst();
        return user;
    }),
    getUserTaps: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const taps = yield db_1.db
            .selectFrom("Tap")
            .where("Tap.userId", "=", id)
            .selectAll()
            .execute();
        return taps;
    }),
    getUserCards: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const cards = yield db_1.db
            .selectFrom("UserCard")
            .innerJoin("Card", "Card.id", "UserCard.cardId")
            .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
            .where("UserCard.userId", "=", id)
            .selectAll()
            .execute();
        return cards;
    }),
    getUserBonuses: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const userBonuses = yield db_1.db
            .selectFrom("UserBonus")
            .where("UserBonus.userId", "=", id)
            .where("UserBonus.isUsed", "=", false)
            .selectAll()
            .execute();
        return userBonuses;
    }),
    getUserBonusesByUserCardId: (userCardId) => __awaiter(void 0, void 0, void 0, function* () {
        const userBonuses = yield db_1.db
            .selectFrom("UserBonus")
            .where("UserBonus.userCardId", "=", userCardId)
            .where("UserBonus.isUsed", "=", false)
            .selectAll()
            .execute();
        return userBonuses;
    }),
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db_1.db
            .insertInto("User")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not create the user."));
        return user;
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield db_1.db
            .updateTable("User")
            .set(data)
            .where("User.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not update the user."));
        return user;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedUser = yield db_1.db
            .deleteFrom("User")
            .where("User.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not delete the user."));
        return deletedUser;
    }),
};
