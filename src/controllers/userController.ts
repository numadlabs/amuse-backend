import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../../custom";

import { hideDataHelper } from "../lib/hideDataHelper";
import { userRepository } from "../repository/userRepository";

export const UserController = {
  updateUser: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const data: Prisma.UserCreateInput = { ...req.body };

    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Could retrieve id from the token.",
      });

    if (req.user.role !== "SUPER_ADMIN" && req.user.id !== id)
      return res.status(200).json({
        success: false,
        data: null,
        error: "You are not allowed to update this user.",
      });

    if (
      data.id ||
      data.role ||
      data.telVerificationCode ||
      data.emailVerificationCode ||
      data.telNumber ||
      data.prefix ||
      data.password
    )
      return res.status(400).json({
        success: false,
        data: null,
        error: "Cannot change id, role and verification codes.",
      });

    try {
      const user = await userServices.update(req.user.id, data);
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
  deleteUser: async (
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
      const deletedUser = await userServices.delete(req.user.id);
      const sanitizedUser = hideDataHelper.sanitizeUserData(deletedUser);

      return res
        .status(200)
        .json({ success: true, data: { user: sanitizedUser } });
    } catch (e) {
      next(e);
    }
  },
  getUserTaps: async (
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
      const taps = await userRepository.getUserTaps(req.user.id);

      return res.status(200).json({ success: true, data: { taps } });
    } catch (e) {
      next(e);
    }
  },
  getUserCards: async (
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
      const cards = await userRepository.getUserCards(req.user.id);

      return res.status(200).json({ success: true, data: { cards } });
    } catch (e) {
      next(e);
    }
  },
  getUserBonuses: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const userBonuses = await userRepository.getUserBonuses(id);

      return res
        .status(200)
        .json({ success: true, data: { userBonuses: userBonuses } });
    } catch (e) {
      next(e);
    }
  },
  getUserBonusesByUserCardId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userCardId } = req.params;
    try {
      const userBonuses = await userRepository.getUserBonusesByUserCardId(
        userCardId
      );

      return res
        .status(200)
        .json({ success: true, data: { userBonuses: userBonuses } });
    } catch (e) {
      next(e);
    }
  },
};
