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
exports.cardController = void 0;
const cardRepository_1 = require("../repository/cardRepository");
const cardServices_1 = require("../services/cardServices");
exports.cardController = {
    createCard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        if (data.id)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Cannot set id field" });
        try {
            const card = yield cardRepository_1.cardRepository.create(data);
            return res.status(200).json({ success: true, data: { card: card } });
        }
        catch (e) {
            next(e);
        }
    }),
    updateCard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        const id = req.params.id;
        if (data.id)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Cannot update id field" });
        try {
            const card = yield cardServices_1.cardServices.update(id, data);
            return res.status(200).json({ success: true, data: { card: card } });
        }
        catch (e) {
            next(e);
        }
    }),
    //cascade delete
    deleteCard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const deletedCard = yield cardServices_1.cardServices.delete(id);
            return res
                .status(200)
                .json({ success: true, data: { card: deletedCard } });
        }
        catch (e) {
            next(e);
        }
    }),
    getCardsByRestaurantId: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurantId = req.params.restaurantId;
        try {
            const cards = yield cardRepository_1.cardRepository.getByRestaurantId(restaurantId);
            return res.status(200).json({
                success: true,
                data: {
                    cards: cards,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    getCardById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const card = yield cardRepository_1.cardRepository.getById(id);
            return res.status(200).json({
                success: true,
                data: {
                    card: card,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    getCards: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            const cards = yield cardRepository_1.cardRepository.get(offset, limit);
            return res.status(200).json({ success: true, data: { cards: cards } });
        }
        catch (e) {
            next(e);
        }
    }),
};
