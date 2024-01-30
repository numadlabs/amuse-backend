import { NextFunction, Request, Response } from "express";
import { generateTokens } from "../utils/jwt";
import { userServices } from "../services/userServices";

export const UserController = {
  //if not confirmed do not return Token
  login: async (req: Request, res: Response, next: NextFunction) => {
    const { prefix, telNumber, password } = req.body;
    if (!prefix || !telNumber || !password)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const user = await userServices.login(prefix, telNumber, password);

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
    const { prefix, telNumber, nickname, password } = req.body;
    if (!prefix || !telNumber || !password || !nickname)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad request" });

    try {
      const createdUser = await userServices.create(
        prefix,
        telNumber,
        nickname,
        password
      );

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
