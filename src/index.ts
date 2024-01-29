import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authenticationRoute";

require("dotenv").config();

const port = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());

app.use(authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server has started on port: ${port}`);
});
