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
exports.tapController = void 0;
const tapRepository_1 = require("../repository/tapRepository");
const tapServices_1 = require("../services/tapServices");
exports.tapController = {
    generateTap: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { restaurantId } = req.body;
        if (!restaurantId)
            return res.status(400).json({
                success: false,
                data: null,
                error: "No restaurantId was found.",
            });
        try {
            const hashedData = yield tapServices_1.tapServices.generateTap(restaurantId);
            return res.status(200).json({ success: true, data: hashedData });
        }
        catch (e) {
            next(e);
        }
    }),
    redeemTap: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { encryptedData } = req.body;
        if (!encryptedData || !((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res
                .status(400)
                .json({ success: false, data: null, error: "No data passed." });
        try {
            const tap = yield tapServices_1.tapServices.redeemTap(encryptedData, req.user.id);
            return res.status(200).json({ success: true, data: { tap: tap } });
        }
        catch (e) {
            next(e);
        }
    }),
    getTapById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const tap = yield tapRepository_1.tapRepository.getTapById(id);
            return tap;
        }
        catch (e) {
            next(e);
        }
    }),
};
