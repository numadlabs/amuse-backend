import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { generateTokens } from "../utils/jwt";
import { hideDataHelper } from "../lib/hideDataHelper";
import { AuthenticatedRequest } from "../../custom";
import jwt from "jsonwebtoken";
import { Insertable } from "kysely";
import { TempUser, User } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { userRepository } from "../repository/userRepository";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<User> = { ...req.body };
    if (!data.prefix || !data.telNumber || !data.password)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

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
  register: async (req: Request, res: Response, next: NextFunction) => {
    const { verificationCode, ...rest } = req.body;
    const data: Insertable<User> = { ...rest };

    if (
      !data.prefix ||
      !data.telNumber ||
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
  sendOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: Insertable<User> = { ...req.body };

      if (!data.telNumber || !data.prefix)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide a phone number.",
        });

      const user = await userServices.setOTP(data);
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
  checkOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { prefix, telNumber } = req.body;
    const { telVerificationCode } = req.body;
    try {
      if (!prefix || !telNumber)
        throw new CustomError(
          "Please provide the prefix and phone number.",
          400
        );
      const isValidOTP = await userServices.checkOTP(
        prefix,
        telNumber,
        telVerificationCode
      );
      if (!isValidOTP)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Invalid verification.",
        });

      const user = hideDataHelper.sanitizeUserData(isValidOTP);

      return res.status(200).json({
        success: true,
        data: {
          user: user,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    const { prefix, telNumber } = req.body;
    const { telVerificationCode, password } = req.body;
    try {
      if (!prefix || !telNumber || !telVerificationCode || !password)
        throw new CustomError("Please provide all the required inputs.", 400);

      const user = await userServices.forgotPassword(
        prefix,
        telNumber,
        telVerificationCode,
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
  sendVerificationEmail: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Could retrieve id from the token.",
      });

    try {
      const user = await userServices.setEmailVerification(req.user?.id);
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
  verifyEmailVerification: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { emailVerificationCode } = req.body;

    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Could retrieve id from the token.",
      });

    if (!emailVerificationCode)
      return res.status(400).json({
        success: false,
        data: null,
        error: "No verification code provided.",
      });

    try {
      const user = await userServices.verifyEmailVerification(
        req.user.id,
        emailVerificationCode
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
  refreshToken: async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

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
  checkTelNumber: async (req: Request, res: Response, next: NextFunction) => {
    const { prefix, telNumber } = req.body;
    try {
      if (!prefix || !telNumber)
        throw new CustomError(
          "Please provide the prefix and phone number.",
          400
        );
      const checkExists = await userRepository.getUserByPhoneNumber(
        telNumber,
        prefix
      );

      if (checkExists)
        throw new CustomError(
          "This phone number has already been registered.",
          400
        );

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
  sendRegisterOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: Insertable<TempUser> = { ...req.body };

      if (!data.telNumber || !data.prefix)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide a phone number.",
        });

      await userServices.sendRegisterOTP(data);

      return res.status(200).json({
        success: true,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  },
  checkRegisterOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { telVerificationCode, prefix, telNumber } = req.body;

      if (!telNumber || !prefix || !telVerificationCode)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide a phone number.",
        });

      await userServices.checkRegisterOTP(
        prefix,
        telNumber,
        telVerificationCode
      );

      return res.status(200).json({
        success: true,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  },
};
