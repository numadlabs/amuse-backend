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
exports.userBonusController = void 0;
const userBonusServices_1 = require("../services/userBonusServices");
exports.userBonusController = {
    useUserBonus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { id } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json("Invalid access token.");
        try {
            const encryptedString = yield userBonusServices_1.userBonusServices.use(id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
            return res.status(200).json({ success: true, data: encryptedString });
        }
        catch (e) {
            next(e);
        }
    }),
    redeemUserBonus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { encryptedData } = req.body;
        if (!encryptedData)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Passed no data ." });
        try {
            const userBonus = yield userBonusServices_1.userBonusServices.redeem(encryptedData);
            return res.status(200).json({ success: true, data: userBonus });
        }
        catch (e) {
            next(e);
        }
    }),
};
