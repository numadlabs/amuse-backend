import express from "express";
import { employeeController } from "../controllers/employeeController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
const employeeRouter = express.Router();

employeeRouter.post(
  "/",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.create
);
employeeRouter.post(
  "/superAdmin",
  authenticateToken,
  authorize("SUPER_ADMIN"),
  employeeController.createAsSuperAdmin
);
employeeRouter.post("/login", employeeController.login);
employeeRouter.post("/sendOTP", employeeController.sendEmailOTP);
employeeRouter.post("/checkOTP", employeeController.checkEmailOTP);
employeeRouter.post("/forgotPassword", employeeController.forgotPassword);
employeeRouter.get(
  "/:restaurantId/restaurant",
  employeeController.getByRestaurantId
);
employeeRouter.get("/:id", employeeController.getById);
employeeRouter.put(
  "/changePassword",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
  employeeController.changePassword
);
employeeRouter.put(
  "/:id",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
  employeeController.updateInfo
);
employeeRouter.put(
  "/:id/role",
  authenticateToken,
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.updateRole
);

export = employeeRouter;
