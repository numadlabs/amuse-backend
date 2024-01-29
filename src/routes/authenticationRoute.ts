import express from "express";
const authRoutes = express.Router();
import { AuthenticationController } from "../controllers/authenticationController";

authRoutes.post("/api/login", AuthenticationController.login);
authRoutes.post("/api/register", AuthenticationController.register);

export = authRoutes;
