import { NextFunction, Request, Response } from "express";
import { generateTokens } from "../utils/jwt";
import { userServices } from "../services/userServices";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../../custom";
import { verify } from "crypto";

export const UserController = {
  //if not confirmed do not return Token
  login: async (req: Request, res: Response, next: NextFunction) => {
    const data: Prisma.UserCreateInput = { ...req.body };
    if (!data.prefix || !data.telNumber || !data.password)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const user = await userServices.login(data);

      if (!user.isTelVerified)
        return res.status(200).json({
          success: true,
          data: {
            user,
          },
        });

      const { accessToken, refreshToken } = generateTokens(user);

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
  register: async (req: Request, res: Response, next: NextFunction) => {
    const data: Prisma.UserCreateInput = { ...req.body };
    if (!data.prefix || !data.telNumber || !data.password || !data.nickname)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const createdUser = await userServices.create(data);

      const { accessToken, refreshToken } = generateTokens(createdUser);

      return res.status(200).json({
        success: true,
        data: {
          user: createdUser,
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
  verifyOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: Prisma.UserCreateInput = { ...req.body };

      const updatedUser = await userServices.verifyOTP(
        id,
        data.telVerificationCode
      );

      return res.status(200).json({
        success: true,
        data: {
          updatedUser,
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

      return res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
