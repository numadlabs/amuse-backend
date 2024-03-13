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
exports.userBonusRepository = void 0;
const db_1 = require("../utils/db");
exports.userBonusRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const userBonus = yield db_1.db
            .insertInto("UserBonus")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Couldn't create userBonus."));
        return userBonus;
    }),
    getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const userBonus = yield db_1.db
            .selectFrom("UserBonus")
            .where("UserBonus.id", "=", id)
            .selectAll()
            .executeTakeFirst();
        return userBonus;
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedUserBonus = yield db_1.db
            .updateTable("UserBonus")
            .set(data)
            .where("UserBonus.id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not update the userBonus."));
        return updatedUserBonus;
    }),
};
