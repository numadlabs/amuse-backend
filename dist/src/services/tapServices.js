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
exports.tapServices = void 0;
const encryptionHelper_1 = require("../lib/encryptionHelper");
const restaurantRepository_1 = require("../repository/restaurantRepository");
const tapRepository_1 = require("../repository/tapRepository");
const userCardRepository_1 = require("../repository/userCardRepository");
const CustomError_1 = require("../exceptions/CustomError");
const constants_1 = require("../lib/constants");
const bonusRepository_1 = require("../repository/bonusRepository");
const userBonusRepository_1 = require("../repository/userBonusRepository");
exports.tapServices = {
    generateTap: (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield restaurantRepository_1.restaurantRepository.getById(restaurantId);
        if (!restaurant)
            throw new CustomError_1.CustomError("Invalid restaurantId", 400);
        const data = {
            restaurantId: restaurantId,
            issuedAt: Date.now(),
        };
        const hashedData = encryptionHelper_1.encryptionHelper.encryptData(JSON.stringify(data));
        return hashedData;
    }),
    redeemTap: (hashedData, userId) => __awaiter(void 0, void 0, void 0, function* () {
        const data = encryptionHelper_1.encryptionHelper.decryptData(hashedData);
        if (Date.now() - data.issuedAt > constants_1.TAP_EXPIRATION_TIME * 1000)
            throw new CustomError_1.CustomError("The QR has expired.", 400);
        const restaurant = yield restaurantRepository_1.restaurantRepository.getById(data.restaurantId);
        if (!restaurant)
            throw new CustomError_1.CustomError("Invalid restaurantId.", 400);
        const userCard = yield userCardRepository_1.userCardReposity.getByUserIdRestaurantId(userId, data.restaurantId);
        if (!userCard)
            throw new CustomError_1.CustomError("You do not have membership card for this restaurant.", 400);
        //if firstTap field is false
        if (!userCard.isFirstTap) {
            const bonus = yield bonusRepository_1.bonusRepository.getFirstTapBonus();
            const userBonus = {
                bonusId: bonus.id,
                userId: userId,
                userCardId: userCard.id,
            };
            yield userBonusRepository_1.userBonusRepository.create(userBonus);
        }
        userCard.isFirstTap = true;
        userCard.visitCount += 1;
        yield userCardRepository_1.userCardReposity.update(userCard, userCard.id);
        const tapData = {
            userCardId: userCard.id,
            userId: userId,
        };
        const tap = yield tapRepository_1.tapRepository.create(tapData);
        return tap;
    }),
};
