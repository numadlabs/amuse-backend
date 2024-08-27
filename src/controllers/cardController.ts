import { NextFunction, Request, Response } from "express";
import { Insertable, Updateable } from "kysely";
import { Card } from "../types/db/types";
import { cardRepository } from "../repository/cardRepository";
import { cardServices } from "../services/cardServices";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";
import { createCardSchema, updateCardSchema } from "../validations/cardSchema";
import {
  idSchema,
  paginationSchema,
  restaurantIdSchema,
} from "../validations/sharedSchema";

export const cardController = {
  createCard: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: Insertable<Card> = createCardSchema.parse(req.body);
      const file = req.file as Express.Multer.File;
      if (!file) throw new CustomError("Please provide the image.", 400);
      if (!req.user) throw new CustomError("Please provide the image.", 400);

      const card = await cardServices.create(data, file, req.user.id);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
  updateCard: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: Updateable<Card> = updateCardSchema.parse(req.body);
      const file = req.file as Express.Multer.File;
      const { id } = idSchema.parse(req.params);

      if (!req.user) throw new CustomError("Please provide the image.", 400);

      const card = await cardServices.update(id, data, file, req.user.id);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
  deleteCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const deletedCard = await cardServices.delete(id);
      return res
        .status(200)
        .json({ success: true, data: { card: deletedCard } });
    } catch (e) {
      next(e);
    }
  },
  getCardsByRestaurantId: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { restaurantId } = restaurantIdSchema.parse(req.params);

      if (!req.user)
        throw new CustomError("Could not retrieve id from the token.", 400);

      const cards = await cardRepository.getByRestaurantIdAndUserId(
        restaurantId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        data: {
          cards: cards,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getCardById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const card = await cardRepository.getById(id);

      return res.status(200).json({
        success: true,
        data: {
          card: card,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getCards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputQuery = paginationSchema.parse(req.query);
      const page = inputQuery.page || 1;
      const pageSize = inputQuery.limit || 20;
      const offset = (page - 1) * pageSize;

      const [cards, totalCards] = await Promise.all([
        cardRepository.get(offset, pageSize),
        cardRepository.count(),
      ]);

      const totalPages = Math.ceil(totalCards.count / pageSize);

      return res.status(200).json({
        success: true,
        data: { cards: cards, totalPages: totalPages, currentPage: page },
      });
    } catch (e) {
      next(e);
    }
  },
};
