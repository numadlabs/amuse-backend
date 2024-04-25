import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../../custom";

import { hideDataHelper } from "../lib/hideDataHelper";
import { userRepository } from "../repository/userRepository";
import { db } from "../utils/db";
import { to_tsquery, to_tsvector } from "../lib/queryHelper";
import { sql } from "kysely";

export const UserController = {
  updateUser: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const data: Prisma.UserCreateInput = { ...req.body };
    const file = req.file as Express.Multer.File;

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
      const user = await userServices.update(req.user.id, data, file);
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
  getUserById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    try {
      const user = await userRepository.getUserById(id);

      if (!user)
        return res
          .status(200)
          .json({ success: false, data: null, error: "User does not exist." });

      const sanitizedUser = hideDataHelper.sanitizeUserData(user);

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
    let { search } = req.query;
    const { latitude, longitude } = req.query;

    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Error on parsing id from the token.",
      });

    if (!latitude || !longitude)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Please provide location.",
      });

    try {
      /* const cards = await userRepository.getUserCards(req.user.id); */
      let query = db
        .selectFrom("UserCard")
        .innerJoin("Card", "Card.id", "UserCard.cardId")
        .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
        .where("UserCard.userId", "=", req.user.id)
        .select(({ eb }) => [
          "UserCard.id",
          "Card.benefits",
          "Card.artistInfo",
          "Card.expiryInfo",
          "Card.instruction",
          "Card.nftImageUrl",
          "UserCard.cardId",
          eb.ref("Restaurant.id").as("restaurantId"),
          "Restaurant.location",
          "Restaurant.latitude",
          "Restaurant.location",
          "Restaurant.category",
          "Restaurant.name",
          "Restaurant.logo",
          "UserCard.visitCount",
          sql`ST_Distance(ST_MakePoint(${eb.ref(
            "Restaurant.latitude"
          )}, ${eb.ref(
            "Restaurant.longitude"
          )}), ST_MakePoint(${latitude}, ${longitude})::geography)`.as(
            "distance"
          ),
          db
            .selectFrom("UserBonus")
            .select(({ eb, fn }) => [
              eb(fn.count<number>("UserBonus.id"), ">", 0).as("count"),
            ])
            .where("UserBonus.userCardId", "=", eb.ref("UserCard.id"))
            .where("UserBonus.isUsed", "=", false)
            .as("hasBonus"),
        ])
        .orderBy("UserCard.mintedAt desc");

      if (search)
        query = query.where((eb) =>
          eb(
            to_tsvector(eb.ref("Restaurant.name")),
            "@@",
            to_tsquery(`${search}`)
          )
        );

      const cards = await query.execute();

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
