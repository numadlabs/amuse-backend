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
exports.userCardReposity = void 0;
const db_1 = require("../utils/db");
exports.userCardReposity = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const userCard = yield db_1.db
            .insertInto("UserCard")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not create the userCard."));
        return userCard;
    }),
    update: (data, id) => __awaiter(void 0, void 0, void 0, function* () {
        const userCard = yield db_1.db
            .updateTable("UserCard")
            .set(data)
            .where("UserCard.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not update the userCard."));
        return userCard;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedUserCard = yield db_1.db
            .deleteFrom("UserCard")
            .where("UserCard.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not delete the userCard."));
        return deletedUserCard;
    }),
    checkExists: (userId, cardId) => __awaiter(void 0, void 0, void 0, function* () {
        const userCards = yield db_1.db
            .selectFrom("UserCard")
            .where("UserCard.cardId", "=", cardId)
            .where("UserCard.userId", "=", userId)
            .selectAll()
            .executeTakeFirst();
        return userCards;
    }),
    getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const userCard = yield db_1.db
            .selectFrom("UserCard")
            .where("UserCard.id", "=", id)
            .selectAll()
            .executeTakeFirstOrThrow(() => new Error("No userCard found with given id."));
        return userCard;
    }),
    getByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const userCards = yield db_1.db
            .selectFrom("UserCard")
            .where("UserCard.userId", "=", userId)
            .selectAll()
            .execute();
        return userCards;
    }),
    //jishee ni ene dr orderBy desc, visitCount tedees deesh ntrig ExpressionBuilder avaad where-luu hiih --> more reusable
    getByRestaurantId: (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
        const userCards = yield db_1.db
            .selectFrom("UserCard")
            .innerJoin("Restaurant", "Restaurant.id", "UserCard.id")
            .select([
            "UserCard.id",
            "UserCard.cardId",
            "UserCard.mintedAt",
            "UserCard.userId",
            "UserCard.ownedAt",
            "UserCard.visitCount",
        ])
            .where("Restaurant.id", "=", restaurantId)
            .execute();
        return userCards;
    }),
    getByUserIdRestaurantId: (userId, restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
        const userCards = yield db_1.db
            .selectFrom("UserCard")
            .innerJoin("Card", "Card.id", "UserCard.cardId")
            .where("Card.restaurantId", "=", restaurantId)
            .where("UserCard.userId", "=", userId)
            .select([
            "UserCard.id",
            "UserCard.cardId",
            "UserCard.mintedAt",
            "UserCard.userId",
            "UserCard.ownedAt",
            "UserCard.visitCount",
            "UserCard.isFirstTap",
        ])
            .executeTakeFirst();
        return userCards;
    }),
};
