"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const notFound_1 = require("./middlewares/notFound");
const errorHandler_1 = require("./middlewares/errorHandler");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const restaurantRoutes_1 = __importDefault(require("./routes/restaurantRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tapRoutes_1 = __importDefault(require("./routes/tapRoutes"));
const userCardRoutes_1 = __importDefault(require("./routes/userCardRoutes"));
const userBonusesRoutes_1 = __importDefault(require("./routes/userBonusesRoutes"));
const bonusRoutes_1 = __importDefault(require("./routes/bonusRoutes"));
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API - 👋🌎🌍🌏",
    });
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/restaurants", restaurantRoutes_1.default);
app.use("/api/cards", cardRoutes_1.default);
app.use("/api/bonus", bonusRoutes_1.default);
app.use("/api/userCards", userCardRoutes_1.default);
app.use("/api/userBonus", userBonusesRoutes_1.default);
app.use("/api/taps", tapRoutes_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
module.exports = app;
