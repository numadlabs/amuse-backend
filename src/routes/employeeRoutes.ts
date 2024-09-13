import express from "express";
import { employeeController } from "../controllers/employeeController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorize } from "../middlewares/authorization";
import {
  authRateLimiter,
  checkOtpRateLimiter,
  forgotPasswordOtpRateLimiter,
  sendOtpRateLimiter,
} from "../middlewares/rateLimiter";
const employeeRouter = express.Router();

employeeRouter.post(
  "/",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.create
);
employeeRouter.post(
  "/superAdmin",
  authenticateToken(),
  authorize("SUPER_ADMIN"),
  employeeController.createAsSuperAdmin
);
employeeRouter.post("/login", authRateLimiter, employeeController.login);
employeeRouter.post(
  "/sendOTP",
  sendOtpRateLimiter,
  employeeController.sendEmailOTP
);
employeeRouter.post(
  "/checkOTP",
  checkOtpRateLimiter,
  employeeController.checkEmailOTP
);
employeeRouter.post(
  "/forgotPassword",
  forgotPasswordOtpRateLimiter,
  employeeController.forgotPassword
);
employeeRouter.put(
  "/onboarding-create-password",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
  employeeController.createPasswordOnboarding
);
employeeRouter.post(
  "/check-password",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
  employeeController.checkPassword
);
employeeRouter.put(
  "/changePassword",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
  employeeController.changePassword
);
employeeRouter.get(
  "/:restaurantId/restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.getByRestaurantId
);
employeeRouter
  .get(
    "/:id",
    authenticateToken(),
    authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
    employeeController.getById
  )
  .put(
    "/:id",
    authenticateToken(),
    authorize("RESTAURANT_OWNER", "RESTAURANT_WAITER", "RESTAURANT_MANAGER"),
    employeeController.updateInfo
  );
employeeRouter.put(
  "/:id/role",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.updateRole
);
employeeRouter.put(
  "/:id/remove-from-restaurant",
  authenticateToken(),
  authorize("RESTAURANT_OWNER", "RESTAURANT_MANAGER"),
  employeeController.removeFromRestaurant
);

export = employeeRouter;
