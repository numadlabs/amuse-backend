"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
exports.CustomError = CustomError;
