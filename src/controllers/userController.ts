import { NextFunction, Request, Response } from "express";
import { userServices } from "../services/userServices";
import { AuthenticatedRequest } from "../../custom";
import { userRepository } from "../repository/userRepository";
import { db } from "../utils/db";
import { to_tsquery, to_tsvector } from "../lib/queryHelper";
import { sql, Updateable } from "kysely";
import { currencyRepository } from "../repository/currencyRepository";
import { CustomError } from "../exceptions/CustomError";
import { User } from "../types/db/types";
import { hideSensitiveData } from "../lib/hideDataHelper";
import {
  idSchema,
  queryFilterSchema,
  userCardIdSchema,
} from "../validations/sharedSchema";
import { updateUserInfoSchema } from "../validations/userSchema";
import { otpSchema } from "../validations/authSchema";

export const UserController = {
  updateInfo: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);
      const data: Updateable<User> = updateUserInfoSchema.parse(req.body);
      const file = req.file as Express.Multer.File;

      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

      if (req.user.id !== id)
        throw new CustomError(
          "You are not authorized to update this user.",
          401
        );

      const user = await userServices.update(req.user.id, data, file);

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
  deleteUser: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);
      const user = await userServices.delete(req.user.id);

      return res.status(200).json({ success: true, data: { user: user } });
    } catch (e) {
      next(e);
    }
  },
  getUserById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idSchema.parse(req.params);

      const user = await userRepository.getUserByIdWithCountry(id);

      if (!user)
        return res
          .status(400)
          .json({ success: false, data: null, error: "User does not exist." });

      const sanitizedUser = hideSensitiveData(user, ["password"]);
      const [btc, currency] = await Promise.all([
        currencyRepository.getByTicker("BTC"),
        currencyRepository.getByTicker("EUR"),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          user: sanitizedUser,
          convertedBalance:
            (Math.floor(user.balance * 10 ** 8) / 10 ** 8) *
            btc.price *
            currency.price,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getUserTaps: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

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
    try {
      const { search, latitude, longitude } = queryFilterSchema.parse(
        req.query
      );

      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

      // if (!latitude || !longitude)
      //   return res.status(400).json({
      //     success: false,
      //     data: null,
      //     error: "Please provide location.",
      //   });

      let query = db
        .selectFrom("UserCard")
        .innerJoin("Card", "Card.id", "UserCard.cardId")
        .innerJoin("Restaurant", "Restaurant.id", "Card.restaurantId")
        .innerJoin("Category", "Category.id", "Restaurant.categoryId")
        .where("UserCard.userId", "=", req.user.id)
        .select(({ eb, fn }) => [
          "UserCard.id",
          "Card.benefits",
          "Card.instruction",
          "Card.nftImageUrl",
          "UserCard.cardId",
          eb.ref("Restaurant.id").as("restaurantId"),
          "Restaurant.location",
          "Restaurant.latitude",
          "Restaurant.categoryId",
          "Category.name as categoryName",
          "Restaurant.name",
          "Restaurant.logo",
          "UserCard.visitCount",
          db
            .selectFrom("UserBonus")
            .select(({ eb, fn }) => [
              eb(fn.count<number>("UserBonus.id"), ">", 0).as("count"),
            ])
            .where("UserBonus.userCardId", "=", eb.ref("UserCard.id"))
            .where("UserBonus.isUsed", "=", false)
            .as("hasBonus"),
          sql`MOD(${eb.ref("UserCard.visitCount")}, ${eb.ref(
            "Restaurant.perkOccurence"
          )})`.as("current"),
          "Restaurant.perkOccurence as target",
          // sql`ST_Distance(ST_MakePoint(${eb.ref(
          //   "Restaurant.latitude"
          // )}, ${eb.ref(
          //   "Restaurant.longitude"
          // )}), ST_MakePoint(${latitude}, ${longitude})::geography)`.as(
          //   "distance"
          // ),
        ])
        .orderBy("UserCard.ownedAt desc");

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
    try {
      const { id } = idSchema.parse(req.params);

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
    try {
      const { userCardId } = userCardIdSchema.parse(req.params);

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
  updateEmail: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { verificationCode, email } = otpSchema.parse(req.body);

      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

      const user = await userServices.updateEmail(
        req.user.id,
        email,
        verificationCode
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
  getDistinctUserLocations: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

      const locations = await userRepository.getDistinctLocations();

      return res.status(200).json({ success: true, data: locations });
    } catch (e) {
      next(e);
    }
  },
  fetchCollectedData: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user)
        throw new CustomError("Could not parse the id from the token.", 400);

      const collectedData = await userServices.fetchCollectedData(req.user.id);

      return res.status(200).json({ success: true, data: collectedData });
    } catch (e) {
      next(e);
    }
  },
};
