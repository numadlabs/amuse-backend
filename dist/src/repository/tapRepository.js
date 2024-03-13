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
exports.tapRepository = void 0;
const db_1 = require("../utils/db");
exports.tapRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const tap = yield db_1.db
            .insertInto("Tap")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow(() => new Error("Could not create the tap."));
        return tap;
    }),
    getTapById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const tap = yield db_1.db
            .selectFrom("Tap")
            .where("Tap.id", "=", id)
            .selectAll()
            .executeTakeFirstOrThrow(() => new Error("No tap was found"));
        return tap;
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const tap = yield db_1.db
            .updateTable("Tap")
            .where("Tap.id", "=", id)
            .set(data)
            .executeTakeFirstOrThrow(() => new Error("Could not update the tap."));
        return tap;
    }),
};
