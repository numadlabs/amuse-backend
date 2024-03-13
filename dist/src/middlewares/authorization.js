"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role)
            throw new Error("Not authenticated/No role provided for authorization check");
        if (!roles.includes(req.user.role)) {
            throw new Error("You are not allowed to do this action.");
        }
        next();
    };
}
exports.authorize = authorize;
