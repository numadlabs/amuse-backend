import { NextFunction, Request, Response } from "express";
import { db } from "../utils/db";
import { userRepository } from "../repository/userRepository";
import { comparePassword, encryptPassword } from "../lib/passwordHelper";
import { generateTokens } from "../utils/jwt";
import { sendOTP } from "../lib/otpHelper";
import { userServices } from "../services/userServices";

export const UserController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    const { prefix, telNumber, password } = req.body;
    if (!prefix || !telNumber || !password)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const user = await userRepository.getUserByPhoneNumber(telNumber, prefix);

      if (!user)
        return res
          .status(400)
          .json({ success: false, data: null, error: "User not found" });

      const isUser = await comparePassword(password, user.password);

      if (!isUser)
        return res.status(400).json({
          success: false,
          data: null,
          error: "One of telNumber or password is invalid",
        });

      const { accessToken, refreshToken } = generateTokens(user);
      user.password = "";
      user.emailVerificationCode = null;
      user.telVerificationCode = null;

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
    const { prefix, telNumber, nickname, password } = req.body;
    if (!prefix || !telNumber || !password || !nickname)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const user = await userRepository.getUserByPhoneNumber(telNumber, prefix);
      if (user)
        return res.status(400).json({
          success: false,
          data: null,
          error: "User already exists with this phone number",
        });

      const hashedPassword = await encryptPassword(password);

      const createdUser = await userRepository.create(
        nickname,
        prefix,
        telNumber,
        hashedPassword.toString()
      );

      if (!createdUser) {
        throw new Error("Could not add user");
      }

      createdUser.password = "";
      createdUser.emailVerificationCode = null;
      createdUser.telVerificationCode = null;

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
      const { prefix, telNumber } = req.body;

      if (!telNumber || !prefix)
        return res.status(400).json({
          success: false,
          data: null,
          error: "Please provide a phone number.",
        });

      const user = await userServices.setOTP(prefix, telNumber);

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
      const { verificationCode } = req.body;

      const updatedUser = await userServices.verifyOTP(id, verificationCode);

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
};
