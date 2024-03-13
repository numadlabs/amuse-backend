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
exports.userCardController = void 0;
const userCardServices_1 = require("../services/userCardServices");
exports.userCardController = {
    buyUserCard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const data = Object.assign({}, req.body);
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== data.userId)
            return res.status(400).json("Different authenticatedUser and userId.");
        try {
            const userCard = yield userCardServices_1.userCardServices.buy(data);
            return res.status(200).json({
                success: true,
                data: {
                    userCard: userCard,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    deleteUserCard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deletedUserCard = yield userCardServices_1.userCardServices.delete(id);
            return res
                .status(200)
                .json({ success: true, data: { userCard: deletedUserCard } });
        }
        catch (e) {
            next(e);
        }
    }),
};
