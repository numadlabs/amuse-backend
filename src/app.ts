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
import tapRouter from "./routes/tapRoutes";
import userCardRoutes from "./routes/userCardRoutes";
import userBonusesRoutes from "./routes/userBonusesRoutes";
import bonusRoutes from "./routes/bonusRoutes";
import { updateCurrencyPrice } from "./cron";
import dashboardRoutes from "./routes/dashboardRoutes";
import timetableRouter from "./routes/timetableRoutes";
import deviceRouter from "./routes/deviceRoutes";
import notificationRouter from "./routes/notificationRoutes";
import employeeRouter from "./routes/employeeRoutes";
import userTierRouter from "./routes/userTierRoutes";
import categoryRouter from "./routes/categoryRoutes";
import transactionRouter from "./routes/transactionRoutes";
import Redis from "ioredis";
import { Server } from "socket.io";
const { createServer } = require("node:http");
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "./config/config";

const app = express();
export const server = createServer(app);
export const io = new Server(server);

console.log(config.REDIS_CONNECTION_STRING.substring(0, 5));
export const pubClient = new Redis(config.REDIS_CONNECTION_STRING);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "API - 👋🌎🌍",
    version: "0.0.1",
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
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);

app.use(notFound);
app.use(errorHandler);

updateCurrencyPrice();
// insertSeed().then(() =>
//   console.log(`Inserted seed data to DB: ${process.env.PGDATABASE}`)
// );

io.on("connection", (socket) => {
  console.log(`socket ID of ${socket.id} connected`);
  socket.on("register", (userId) => {
    pubClient.set(`socket:${userId}`, socket.id, "EX", 300);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

export default app;
