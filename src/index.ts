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

require("dotenv").config();

const port = process.env.PORT || 3001;

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

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", restaurantRoutes);
app.use("/api", cardRoutes);
app.use("/api", userBonusesRouter);
app.use("/api/taps", tapRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server has started on port: ${port}`);
});
