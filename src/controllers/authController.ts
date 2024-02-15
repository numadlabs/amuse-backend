import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { generateTokens } from "../utils/jwt";
import { hideDataHelper } from "../lib/hideDataHelper";
import { AuthenticatedRequest } from "../../custom";
import jwt from "jsonwebtoken";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    const data: Prisma.UserCreateInput = { ...req.body };
    if (!data.prefix || !data.telNumber || !data.password)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const user = await userServices.login(data);

      //activate it when OTP starts working
      /* if (!user.isTelVerified)
            return res.status(200).json({
              success: true,
              data: {
                user,
              },
            }); */

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
    const data: Prisma.UserCreateInput = { ...req.body };
    if (
      !data.prefix ||
      !data.telNumber ||
      !data.password ||
      !data.nickname ||
      data.role
    )
      return res.status(400).json({ success: false, error: "Bad request" });

    try {
      const createdUser = await userServices.create(data);

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
      const data: Prisma.UserCreateInput = { ...req.body };

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
    const { id } = req.params;
    const { telVerificationCode } = req.body;
    try {
      const isValidOTP = await userServices.checkOTP(id, telVerificationCode);
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
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { telVerificationCode, password } = req.body;
    try {
      const user = await userServices.changePassword(
        id,
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
  verifyOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { telVerificationCode } = req.body;

      const updatedUser = await userServices.verifyOTP(id, telVerificationCode);
      const sanitizedUser = hideDataHelper.sanitizeUserData(updatedUser);

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
          sanitizedUser,
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
};
