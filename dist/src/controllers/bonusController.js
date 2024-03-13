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
exports.bonusController = void 0;
const bonusRepository_1 = require("../repository/bonusRepository");
exports.bonusController = {
    createBonus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        if (!data.cardId || !data.imageUrl || !data.name || data.id)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Bad request." });
        try {
            //different creating options such as creating UserBonus for every user, or with conditions
            const createdBonus = yield bonusRepository_1.bonusRepository.create(data);
            return res.status(200).json({
                success: true,
                data: {
                    bonus: createdBonus,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    updateBonus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        const { id } = req.params;
        if (data.id)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Cannot update id field." });
        try {
            const updatedBonus = yield bonusRepository_1.bonusRepository.update(data, id);
            return res
                .status(200)
                .json({ success: true, data: { bonus: updatedBonus } });
        }
        catch (e) {
            next(e);
        }
    }),
    deleteBonus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deletedBonus = yield bonusRepository_1.bonusRepository.delete(id);
            return res
                .status(200)
                .json({ success: true, data: { bonus: deletedBonus } });
        }
        catch (e) {
            next(e);
        }
    }),
};
