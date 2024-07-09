import express from "express";
import { inviteController } from "../controllers/inviteController";
const inviteRouter = express.Router();

inviteRouter.post("/", inviteController.create);
inviteRouter.post("/:id/check", inviteController.checkExists);
inviteRouter.post("/:id/setOTP", inviteController.setOTP);

export = inviteRouter;
