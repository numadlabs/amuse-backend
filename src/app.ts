import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import restaurantRoutes from "./routes/restaurantRoutes";
import cardRoutes from "./routes/cardRoutes";
import authRoutes from "./routes/authRoutes";
import userBonusesRouter from "./routes/userBonusesRoutes";
import tapRouter from "./routes/tapRoutes";
import userCardRoutes from "./routes/userCardRoutes";
import userBonusesRoutes from "./routes/userBonusesRoutes";
import bonusRoutes from "./routes/bonusRoutes";
import { updateCurrencyPrice } from "./cron/updateBtcPrice";
import dashboardRoutes from "./routes/dashboardRoutes";
import timetableRouter from "./routes/timetableRoutes";
import deviceRouter from "./routes/deviceRoutes";
import notificationRouter from "./routes/notificationRoutes";
import employeeRouter from "./routes/employeeRoutes";
import userTierRouter from "./routes/userTierRoutes";
import { db } from "./utils/db";
import { userTierRepository } from "./repository/userTierRepository";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "API - 👋🌎🌍🌏",
  });
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/bonus", bonusRoutes);
app.use("/api/userCards", userCardRoutes);
app.use("/api/userBonus", userBonusesRoutes);
app.use("/api/taps", tapRouter);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/timetables", timetableRouter);
app.use("/api/devices", deviceRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/userTiers", userTierRouter);

app.use(notFound);
app.use(errorHandler);

updateCurrencyPrice();

export = app;
