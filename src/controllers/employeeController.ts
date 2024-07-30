import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { employeeServices } from "../services/employeeServices";
import { generateTokens } from "../utils/jwt";
import { hideDataHelper } from "../lib/hideDataHelper";
import { Insertable } from "kysely";
import { Employee } from "../types/db/types";
import { employeeRepository } from "../repository/employeeRepository";
import { AuthenticatedRequest } from "../../custom";
import { ROLES } from "../types/db/enums";

export const employeeController = {
  create: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const data: Insertable<Employee> = req.body;

    try {
      if (!data.restaurantId)
        throw new CustomError("Please provide a restaurantId.", 400);

      if (!req.user?.id || !req.user?.role)
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
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data: Insertable<Employee> = req.body;

    try {
      const employee = await employeeServices.createAsSuperAdmin(data);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
      if (!email || !password)
        throw new CustomError("Please provide email and password.", 400);

      const employee = await employeeServices.login(email, password);

      const { accessToken, refreshToken } = generateTokens(employee);

      const sanitizedEmployee = hideDataHelper.sanitizeEmployeeData(employee);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedEmployee,
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
    const { email } = req.body;

    try {
      if (!email) throw new CustomError("Please provide the email.", 400);

      const employee = await employeeServices.setEmailOTP(email);

      return res.status(200).json({ success: true, data: employee });
    } catch (e) {
      next(e);
    }
  },
  checkEmailOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { email, verificationCode } = req.body;

    try {
      if (!email || !verificationCode)
        throw new CustomError(
          "Please provide the email and the verification code.",
          400
        );

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
    const { email } = req.body;
    const { verificationCode, password } = req.body;
    try {
      if (!email || !verificationCode || !password)
        throw new CustomError("Please provide all the required inputs.", 400);

      const employee = await employeeServices.forgotPassword(
        email,
        verificationCode,
        password
      );
      const sanitizedEmployee = hideDataHelper.sanitizeEmployeeData(employee);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedEmployee,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    try {
      const employees = await employeeRepository.getByRestaurantId(
        restaurantId
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
    const { id } = req.params;
    const data: Insertable<Employee> = req.body;

    try {
      if (!req.user?.id)
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
    const { id } = req.params;
    const role: ROLES = req.body.role;

    try {
      if (!req.user?.id)
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
    const { oldPassword, newPassword } = req.body;

    try {
      if (!req.user?.id)
        throw new CustomError(
          "Could not parse the info from the auth token.",
          400
        );

      const employee = await employeeServices.changePassword(
        req.user.id,
        oldPassword,
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
};
