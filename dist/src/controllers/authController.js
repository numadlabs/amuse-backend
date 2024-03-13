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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const userServices_1 = require("../services/userServices");
const jwt_1 = require("../utils/jwt");
const hideDataHelper_1 = require("../lib/hideDataHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authController = {
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        if (!data.prefix || !data.telNumber || !data.password)
            return res
                .status(400)
                .json({ success: false, data: null, error: "Bad request" });
        try {
            const user = yield userServices_1.userServices.login(data);
            //activate it when OTP starts working
            /* if (!user.isTelVerified)
                  return res.status(200).json({
                    success: true,
                    data: {
                      user,
                    },
                  }); */
            const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user);
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(user);
            return res.status(200).json({
                success: true,
                data: {
                    user: sanitizedUser,
                    auth: {
                        accessToken,
                        refreshToken,
                    },
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = Object.assign({}, req.body);
        if (!data.prefix ||
            !data.telNumber ||
            !data.password ||
            !data.nickname ||
            data.role)
            return res.status(400).json({ success: false, error: "Bad request" });
        try {
            const createdUser = yield userServices_1.userServices.create(data);
            const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(createdUser);
            const user = hideDataHelper_1.hideDataHelper.sanitizeUserData(createdUser);
            return res.status(200).json({
                success: true,
                data: {
                    user: user,
                    auth: {
                        accessToken,
                        refreshToken,
                    },
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    sendOTP: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = Object.assign({}, req.body);
            if (!data.telNumber || !data.prefix)
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: "Please provide a phone number.",
                });
            const user = yield userServices_1.userServices.setOTP(data);
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
    checkOTP: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { telVerificationCode } = req.body;
        try {
            const isValidOTP = yield userServices_1.userServices.checkOTP(id, telVerificationCode);
            if (!isValidOTP)
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: "Invalid verification.",
                });
            const user = hideDataHelper_1.hideDataHelper.sanitizeUserData(isValidOTP);
            return res.status(200).json({
                success: true,
                data: {
                    user: user,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    changePassword: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { telVerificationCode, password } = req.body;
        try {
            const user = yield userServices_1.userServices.changePassword(id, telVerificationCode, password);
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
    verifyOTP: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { telVerificationCode } = req.body;
            const updatedUser = yield userServices_1.userServices.verifyOTP(id, telVerificationCode);
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(updatedUser);
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
    sendVerificationEmail: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Could retrieve id from the token.",
            });
        try {
            const user = yield userServices_1.userServices.setEmailVerification((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
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
    verifyEmailVerification: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const { emailVerificationCode } = req.body;
        if (!((_c = req.user) === null || _c === void 0 ? void 0 : _c.id))
            return res.status(400).json({
                success: false,
                data: null,
                error: "Could retrieve id from the token.",
            });
        if (!emailVerificationCode)
            return res.status(400).json({
                success: false,
                data: null,
                error: "No verification code provided.",
            });
        try {
            const user = yield userServices_1.userServices.verifyEmailVerification(req.user.id, emailVerificationCode);
            const sanitizedUser = hideDataHelper_1.hideDataHelper.sanitizeUserData(user);
            return res.status(200).json({
                success: true,
                data: {
                    sanitizedUser,
                },
            });
        }
        catch (e) {
            next(e);
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const refreshToken = req.body.refreshToken;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshToken)
            return res.status(401).json({
                success: false,
                data: null,
                error: `Please provide a refresh token.`,
            });
        if (jwtRefreshSecret === undefined) {
            return res.status(500).json({
                success: false,
                data: null,
                error: `Internal server error.`,
            });
        }
        jsonwebtoken_1.default.verify(refreshToken, jwtRefreshSecret, (err, user) => {
            if (err)
                return res.status(403).json({
                    success: false,
                    data: null,
                    error: `Invalid refresh token.`,
                });
            const tokens = (0, jwt_1.generateTokens)(user);
            return res.status(200).json({
                success: true,
                data: tokens,
            });
        });
    }),
};
