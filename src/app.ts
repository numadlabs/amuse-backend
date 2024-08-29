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
import { insertSeed } from "./seeders/main";
import morgan from "morgan";
import logger from "./config/winston";
import { rateLimiter } from "./middlewares/rateLimiter";
import { sizeLimitConstants } from "./lib/constants";

const app = express();

app.use(cors());
app.use(express.json({ limit: sizeLimitConstants.jsonSizeLimit }));
app.use(
  express.urlencoded({
    limit: sizeLimitConstants.formDataSizeLimit,
    extended: true,
  })
);
app.use(helmet());
app.use(bodyParser.json());

app.use(rateLimiter);

const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(logObject);
      },
    },
  })
);

app.get("/", (req: Request, res: Response) => {
  setTimeout(() => {
    res.status(200).json({
      message: "API - 👋🌎🌍",
      version: "0.0.1",
    });
  }, 5000);
});
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
//   logger.info(`Inserted seed data to DB: ${process.env.PGDATABASE}`)
// );

export default app;
