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
exports.userBonusServices = void 0;
const CustomError_1 = require("../exceptions/CustomError");
const constants_1 = require("../lib/constants");
const encryptionHelper_1 = require("../lib/encryptionHelper");
const userBonusRepository_1 = require("../repository/userBonusRepository");
exports.userBonusServices = {
    use: (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
        /*
            check if userBonus is authenticatedUsersOwn
            check if userBonus is not used
        */
        const userBonus = yield userBonusRepository_1.userBonusRepository.getById(id);
        if (!userBonus)
            throw new CustomError_1.CustomError("No corresponding userBonus found.", 400);
        if ((userBonus === null || userBonus === void 0 ? void 0 : userBonus.userId) !== userId)
            throw new CustomError_1.CustomError("You are not allowed to use this bonus.", 400);
        if (userBonus.isUsed)
            throw new CustomError_1.CustomError("This bonus is used already.", 400);
        const data = {
            userBonusId: userBonus.id,
            issuedAt: Date.now(),
        };
        const encryptedData = encryptionHelper_1.encryptionHelper.encryptData(JSON.stringify(data));
        return encryptedData;
    }),
    redeem: (encryptedData) => __awaiter(void 0, void 0, void 0, function* () {
        const data = encryptionHelper_1.encryptionHelper.decryptData(encryptedData);
        if (Date.now() - data.issuedAt > constants_1.BONUS_REDEEM_EXPIRATION_TIME * 1000)
            throw new CustomError_1.CustomError("The QR has expired.", 400);
        const userBonusId = data.userBonusId;
        const userBonus = yield userBonusRepository_1.userBonusRepository.getById(userBonusId);
        if (!userBonus)
            throw new CustomError_1.CustomError("Invalid userBonus.", 400);
        userBonus.isUsed = true;
        const updatedUserBonus = yield userBonusRepository_1.userBonusRepository.update(userBonus.id, userBonus);
        return updatedUserBonus;
    }),
};
