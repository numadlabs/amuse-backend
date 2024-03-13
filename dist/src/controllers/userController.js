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
exports.UserController = void 0;
const userServices_1 = require("../services/userServices");
const hideDataHelper_1 = require("../lib/hideDataHelper");
const userRepository_1 = require("../repository/userRepository");
const db_1 = require("../utils/db");
const queryHelper_1 = require("../lib/queryHelper");
const kysely_1 = require("kysely");
exports.UserController = {
    updateUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const data = Object.assign({}, req.body);
        const file = req.file;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Could retrieve id from the token.",
            });
        if (req.user.role !== "SUPER_ADMIN" && req.user.id !== id)
            return res.status(200).json({
                success: false,
                data: null,
                error: "You are not allowed to update this user.",
            });
        if (data.id ||
            data.role ||
            data.telVerificationCode ||
            data.emailVerificationCode ||
            data.telNumber ||
            data.prefix ||
            data.password)
            return res.status(400).json({
                success: false,
                data: null,
                error: "Cannot change id, role and verification codes.",
            });
        try {
            const user = yield userServices_1.userServices.update(req.user.id, data, file);
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(user);
            return res.status(200).json({
                success: true,
                data: {
                    user: sanitizedUser,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    deleteUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Could retrieve id from the token.",
            });
        try {
            const deletedUser = yield userServices_1.userServices.delete(req.user.id);
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(deletedUser);
            return res
                .status(200)
                .json({ success: true, data: { user: sanitizedUser } });
        }
        catch (e) {
            next(e);
        }
    }),
    getUserById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const user = yield userRepository_1.userRepository.getUserById(id);
            if (!user)
                return res
                    .status(200)
                    .json({ success: false, data: null, error: "User does not exist." });
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(user);
            return res
                .status(200)
                .json({ success: true, data: { user: sanitizedUser } });
        }
        catch (e) {
            next(e);
        }
    }),
    getUserTaps: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        if (!((_c = req.user) === null || _c === void 0 ? void 0 : _c.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Could retrieve id from the token.",
            });
        try {
            const taps = yield userRepository_1.userRepository.getUserTaps(req.user.id);
            return res.status(200).json({ success: true, data: { taps } });
        }
        catch (e) {
            next(e);
        }
    }),
    getUserCards: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        let { search } = req.query;
        const { latitude, longitude } = req.query;
        if (!((_d = req.user) === null || _d === void 0 ? void 0 : _d.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Error on parsing id from the token.",
            });
        if (!latitude || !longitude)
            return res.status(400).json({
                success: false,
                data: null,
                error: "Please provide location.",
            });
        try {
            /* const cards = await userRepository.getUserCards(req.user.id); */
            let query = db_1.db
                .selectFrom("UserCard")
                .innerJoin("Card", "Card.id", "UserCard.cardId")
                .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
                .where("UserCard.userId", "=", req.user.id)
                .select(({ eb, fn }) => [
                "UserCard.id",
                "Card.benefits",
                "Card.artistInfo",
                "Card.expiryInfo",
                "Card.instruction",
                "Card.nftImageUrl",
                "UserCard.cardId",
                "Restaurant.location",
                "Restaurant.latitude",
                "Restaurant.location",
                "Restaurant.category",
                "Restaurant.name",
                "UserCard.visitCount",
                (0, kysely_1.sql) `ST_Distance(ST_MakePoint(${eb.ref("Restaurant.latitude")}, ${eb.ref("Restaurant.longitude")}), ST_MakePoint(${latitude}, ${longitude})::geography)`.as("distance"),
            ]);
            if (search)
                query = query.where((eb) => eb((0, queryHelper_1.to_tsvector)(eb.ref("Restaurant.name")), "@@", (0, queryHelper_1.to_tsquery)(`${search}`)));
            const cards = yield query.execute();
            return res.status(200).json({ success: true, data: { cards } });
        }
        catch (e) {
            next(e);
        }
    }),
    getUserBonuses: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const userBonuses = yield userRepository_1.userRepository.getUserBonuses(id);
            return res
                .status(200)
                .json({ success: true, data: { userBonuses: userBonuses } });
        }
        catch (e) {
            next(e);
        }
    }),
    getUserBonusesByUserCardId: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { userCardId } = req.params;
        try {
            const userBonuses = yield userRepository_1.userRepository.getUserBonusesByUserCardId(userCardId);
            return res
                .status(200)
                .json({ success: true, data: { userBonuses: userBonuses } });
        }
        catch (e) {
            next(e);
        }
    }),
};
