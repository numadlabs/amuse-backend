"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.generateRefreshToken = exports.extractVerification = exports.generateVerificationToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const ACCESS_TOKEN_EXPIRATION_TIME = process.env.JWT_ACCESS_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = process.env.JWT_REFRESH_EXPIRATION_TIME;
function generateAccessToken(user) {
    const jwtAccesSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtAccesSecret) {
        throw new Error("JWT_REFRESH_SECRET is not defined.");
    }
    return (0, jsonwebtoken_1.sign)({ id: user.id, role: user.role }, jwtAccesSecret, {
        expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
    });
}
exports.generateAccessToken = generateAccessToken;
function generateVerificationToken(verificationCode, duration) {
    const jwtVerificationSecret = process.env.JWT_VERIFICATION_SECRET;
    if (!jwtVerificationSecret) {
        throw new Error("JWT_REFRESH_SECRET is not defined.");
    }
    return (0, jsonwebtoken_1.sign)({ verificationCode: verificationCode }, jwtVerificationSecret, {
        expiresIn: duration,
    });
}
exports.generateVerificationToken = generateVerificationToken;
//turn it into function that just returns JWT-payload
function extractVerification(token) {
    const jwtVerificationSecret = process.env.JWT_VERIFICATION_SECRET;
    if (!jwtVerificationSecret) {
        throw new Error("JWT_REFRESH_SECRET is not defined.");
    }
    let verificationCode = 0;
    (0, jsonwebtoken_1.verify)(token, jwtVerificationSecret, (err, payload) => {
        if (err)
            throw new Error(`Invalid token ${err}`);
        verificationCode = payload.verificationCode;
    });
    return verificationCode;
}
exports.extractVerification = extractVerification;
function generateRefreshToken(user) {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
        throw new Error("JWT_REFRESH_SECRET is not defined.");
    }
    return (0, jsonwebtoken_1.sign)({ id: user.id, role: user.role }, jwtRefreshSecret, {
        expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
    });
}
exports.generateRefreshToken = generateRefreshToken;
function generateTokens(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return {
        accessToken,
        refreshToken,
    };
}
exports.generateTokens = generateTokens;
