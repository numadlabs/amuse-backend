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
exports.userCardServices = void 0;
const cardRepository_1 = require("../repository/cardRepository");
const userCardRepository_1 = require("../repository/userCardRepository");
const CustomError_1 = require("../exceptions/CustomError");
exports.userCardServices = {
    buy: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const userCard = yield userCardRepository_1.userCardReposity.checkExists(data.userId, data.cardId);
        if (userCard)
            throw new CustomError_1.CustomError("You already have this card.", 400);
        const isValidCard = yield cardRepository_1.cardRepository.getById(data.cardId);
        if (!isValidCard)
            throw new CustomError_1.CustomError("Invalid restaurant id.", 400);
        const createdUserCard = yield userCardRepository_1.userCardReposity.create(data);
        return createdUserCard;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const userCard = yield userCardRepository_1.userCardReposity.getById(id);
        const deletedUserCard = yield userCardRepository_1.userCardReposity.delete(userCard.id);
        return deletedUserCard;
    }),
};
