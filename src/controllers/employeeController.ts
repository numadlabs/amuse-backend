import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { employeeServices } from "../services/employeeServices";
import { Insertable, Updateable } from "kysely";
import { Employee } from "../types/db/types";
import { employeeRepository } from "../repository/employeeRepository";
import { AuthenticatedRequest } from "../../custom";
import {
  createEmployeeSchema,
  passwordSchema,
  updateEmployeeSchema,
} from "../validations/employeeSchema";
import {
  changePasswordSchema,
  checkPasswordSchema,
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  otpSchema,
} from "../validations/authSchema";
import {
  idSchema,
  restaurantIdSchema,
  roleSchema,
} from "../validations/sharedSchema";
import { hideSensitiveData } from "../lib/hideDataHelper";

export const employeeController = {
  create: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = createEmployeeSchema.parse(req.body);
      const data: Insertable<Employee> = { ...req.body };

      if (!req.user)
        throw new CustomError("Could not parse info from the token.", 400);

      const employee = await employeeServices.create(data, req.user.id);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  createAsSuperAdmin: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = createEmployeeSchema.parse(req.body);
      const data: Insertable<Employee> = { ...req.body };
      if (!req.user)
        throw new CustomError("Could not retrieve info from the token.", 401);

      const employee = await employeeServices.createAsSuperAdmin(
        data,
        req.user.id
      );
      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const { employee, accessToken, refreshToken } =
        await employeeServices.login(email, password);

      return res.status(200).json({
        success: true,
        data: {
          user: employee,
          auth: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  },
  sendEmailOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = emailSchema.parse(req.body);

      const employee = await employeeServices.setEmailOTP(email);

      return res.status(200).json({ success: true, data: employee });
    } catch (e) {
      next(e);
    }
  },
  checkEmailOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, verificationCode } = otpSchema.parse(req.body);

      const employee = await employeeServices.checkEmailOTP(
        email,
        verificationCode
      );

      return res.status(200).json({ success: true, data: employee });
    } catch (e) {
      next(e);
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, verificationCode, password } = forgotPasswordSchema.parse(
        req.body
      );

      const employee = await employeeServices.forgotPassword(
        email,
        verificationCode,
        password
      );

      return res.status(200).json({
        success: true,
        data: {
          user: employee,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getByRestaurantId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employees = await employeeServices.getByRestaurantId(
        restaurantId,
        req.user?.id
      );

      return res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (e) {
      next(e);
    }
  },
  updateInfo: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      const data: Updateable<Employee> = updateEmployeeSchema.parse(req.body);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.updateInfo(data, id, req.user.id);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  updateRole: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      const { role } = roleSchema.parse(req.body);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.updateRole(role, id, req.user.id);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  changePassword: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        req.body
      );

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  getById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      const employee = await employeeRepository.getById(id);
      if (!employee) throw new CustomError("Employee does not exist.", 400);
      const sanitizedEmployee = hideSensitiveData(employee, ["password"]);

      return res.status(200).json({
        success: true,
        data: sanitizedEmployee,
      });
    } catch (e) {
      next(e);
    }
  },
  checkPassword: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { currentPassword } = checkPasswordSchema.parse(req.body);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.checkPassword(
        req.user.id,
        currentPassword
      );
      const sanitizedEmployee = hideSensitiveData(employee, ["password"]);

      return res.status(200).json({
        success: true,
        data: sanitizedEmployee,
      });
    } catch (e) {
      next(e);
    }
  },
  removeFromRestaurant: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.removeFromTeam(id, req.user.id);
      const sanitizedEmployee = hideSensitiveData(employee, ["password"]);

      return res.status(200).json({
        success: true,
        data: sanitizedEmployee,
      });
    } catch (e) {
      next(e);
    }
  },
  createPasswordOnboarding: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { password } = passwordSchema.parse(req.body);

      if (!req.user)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.createPasswordOnboarding(
        password,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
};
