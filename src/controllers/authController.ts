import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { generateTokens } from "../utils/jwt";
import { hideDataHelper } from "../lib/hideDataHelper";
import { AuthenticatedRequest } from "../../custom";
import jwt from "jsonwebtoken";
import { Insertable } from "kysely";
import { User } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { userRepository } from "../repository/userRepository";
import { config } from "../config/config";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<User> = { ...req.body };

    try {
      const user = await userServices.login(data);
      const { accessToken, refreshToken } = generateTokens(user);
      const sanitizedUser = hideDataHelper.sanitizeUserData(user);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedUser,
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
  sendOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const otp = await userServices.sendOTP(email);

      return res.status(200).json({
        success: true,
        data: {
          otp: otp,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  checkOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { email, verificationCode } = req.body;
    try {
      if (!email)
        throw new CustomError(
          "Please provide the prefix and phone number.",
          400
        );
      const isValidOTP = await userServices.checkOTP(email, verificationCode);

      return res.status(200).json({
        success: true,
        data: {
          isValidOTP,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  register: async (req: Request, res: Response, next: NextFunction) => {
    const { verificationCode, ...rest } = req.body;
    const data: Insertable<User> = { ...rest };

    if (
      !data.email ||
      !data.password ||
      !data.nickname ||
      data.role ||
      data.balance
    )
      return res.status(400).json({ success: false, error: "Bad request" });

    try {
      const createdUser = await userServices.create(data, verificationCode);

      const { accessToken, refreshToken } = generateTokens(createdUser);

      const user = hideDataHelper.sanitizeUserData(createdUser);

      return res.status(200).json({
        success: true,
        data: {
          user: user,
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
  refreshToken: async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    const jwtRefreshSecret = config.JWT_REFRESH_SECRET;

    if (!refreshToken)
      return res.status(401).json({
        success: false,
        data: null,
        error: `Please provide a refresh token.`,
      });
    if (jwtRefreshSecret === undefined) {
      return res.status(500).json({
        success: false,
        data: null,
        error: `Internal server error.`,
      });
    }

    jwt.verify(refreshToken, jwtRefreshSecret, (err: any, user: any) => {
      if (err)
        return res.status(403).json({
          success: false,
          data: null,
          error: `Invalid refresh token.`,
        });

      const tokens = generateTokens(user);
      return res.status(200).json({
        success: true,
        data: tokens,
      });
    });
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    const { verificationCode, password, email } = req.body;
    try {
      if (!verificationCode || !password)
        throw new CustomError("Please provide all the required inputs.", 400);

      const user = await userServices.forgotPassword(
        email,
        verificationCode,
        password
      );
      const sanitizedUser = hideDataHelper.sanitizeUserData(user);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedUser,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  checkEmail: async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
      if (!email) throw new CustomError("Please provide the email.", 400);
      const checkExists = await userRepository.getByEmail(email);

      if (checkExists)
        throw new CustomError("This email has already been registered.", 400);

      return res.status(200).json({
        success: true,
        data: {
          user: null,
        },
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
      if (!oldPassword || !newPassword || !req.user?.id)
        throw new CustomError("Please provide all the required inputs.", 400);

      const user = await userServices.changePassword(
        req.user.id,
        oldPassword,
        newPassword
      );
      const sanitizedUser = hideDataHelper.sanitizeUserData(user);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedUser,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
