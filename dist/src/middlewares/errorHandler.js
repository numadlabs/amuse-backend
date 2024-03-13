"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    const statusCode = err.errorCode === undefined
        ? res.statusCode !== 200
            ? res.statusCode
            : 500
        : err.errorCode;
    res.status(statusCode);
    res.json({
        success: false,
        data: null,
        error: err.message,
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
}
exports.errorHandler = errorHandler;
