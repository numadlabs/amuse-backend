import express from "express";
import { countryController } from "../controllers/countryController";
import { authenticateToken } from "../middlewares/authenticateToken";
const countryRouter = express.Router();

countryRouter.get("/", authenticateToken(), countryController.get);

export = countryRouter;
