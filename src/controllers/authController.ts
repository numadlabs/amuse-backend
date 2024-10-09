import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { userRepository } from "../repository/userRepository";
import {
  accessTokenRequestSchema,
  changePasswordSchema,
  emailSchema,
  forgotPasswordSchema,
  googleTokenSchema,
  loginSchema,
  otpSchema,
  refreshTokenSchema,
  registerSchema,
} from "../validations/authSchema";
import { getGoogleUserInfo } from "../lib/oauthHelper";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body);

      const { user, accessToken, refreshToken } = await userServices.login(
        input.email,
        input.password
      );

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
      const input = emailSchema.parse(req.body);

      const otp = await userServices.sendOTP(input.email);

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
    try {
      const input = otpSchema.parse(req.body);

      const isValidOTP = await userServices.checkOTP(
        input.email,
        input.verificationCode
      );

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
    try {
      const input = registerSchema.parse(req.body);

      const { user, accessToken, refreshToken } = await userServices.create(
        input.email,
        input.password,
        input.nickname,
        input.verificationCode
      );

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
  verifyRefreshToken: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      const tokens = await verifyRefreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (e) {
      next(e);
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationCode, password, email } = forgotPasswordSchema.parse(
        req.body
      );

      const user = await userServices.forgotPassword(
        email,
        verificationCode,
        password
      );

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
  checkEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = emailSchema.parse(req.body);
      const checkExists = await userRepository.getByEmail(email);
      if (checkExists)
        return res.status(200).json({
          success: true,
          data: {
            isEmailRegistered: true,
          },
        });

      return res.status(200).json({
        success: true,
        data: {
          isEmailRegistered: false,
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
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        req.body
      );

      if (!req.user) throw new CustomError("Could not parse the token.", 400);

      const user = await userServices.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

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
  verifyAccessToken: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { accessToken } = accessTokenRequestSchema.parse(req.body);

      const user = await verifyAccessToken(accessToken);

      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (e) {
      next(e);
    }
  },
  signInByGoogle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = googleTokenSchema.parse(req.body);

      const googleUser = await getGoogleUserInfo(token);
      if (!googleUser) throw new CustomError("Invalid Google token.", 400);

      const result = await userServices.createUserIfNotExists(
        googleUser.name!,
        googleUser.email!
      );

      return res.status(200).json({
        success: true,
        data: {
          user: result.user,
          auth: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
