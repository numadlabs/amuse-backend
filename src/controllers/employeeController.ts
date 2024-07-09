import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { employeeServices } from "../services/employeeServices";
import { generateTokens } from "../utils/jwt";
import { hideDataHelper } from "../lib/hideDataHelper";
import { Insertable } from "kysely";
import { Employee } from "../types/db/types";
import { employeeRepository } from "../repository/employeeRepository";

export const employeeController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const { inviteId, verificationCode, ...rest } = req.body;
    const data: Insertable<Employee> = rest;

    try {
      const employee = await employeeServices.create(
        data,
        inviteId,
        verificationCode
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

      const employee = await employeeServices.changePassword(
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
  update: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data: Insertable<Employee> = req.body;

    try {
      const employee = await employeeServices.update(data, id);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (e) {
      next(e);
    }
  },
};
