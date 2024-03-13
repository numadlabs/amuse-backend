"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`Not found - ${req.originalUrl}`);
    next(error);
}
exports.notFound = notFound;
