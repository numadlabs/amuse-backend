import express from "express";
import { employeeController } from "../controllers/employeeController";
const employeeRouter = express.Router();

employeeRouter.post("/", employeeController.create);
employeeRouter.post("/login", employeeController.login);
employeeRouter.post("/sendOTP", employeeController.sendEmailOTP);
employeeRouter.post("/checkOTP", employeeController.checkEmailOTP);
employeeRouter.post("/forgotPassword", employeeController.forgotPassword);
employeeRouter.get(
  "/:restaurantId/restaurant",
  employeeController.getByRestaurantId
);
employeeRouter.put("/:id", employeeController.update);

export = employeeRouter;
