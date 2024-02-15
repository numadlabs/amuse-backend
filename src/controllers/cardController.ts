import { NextFunction, Request, Response } from "express";
import { Insertable, Updateable } from "kysely";
import { Card } from "../types/db/types";
import { cardRepository } from "../repository/cardRepository";
import { cardServices } from "../services/cardServices";
import { AuthenticatedRequest } from "../../custom";
import { UserCard } from "@prisma/client";

export const cardController = {
  createCard: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Card> = { ...req.body };
    if (data.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Cannot set id field" });

    try {
      const card = await cardRepository.create(data);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
  updateCard: async (req: Request, res: Response, next: NextFunction) => {
    const data: Updateable<Card> = { ...req.body };
    const id = req.params.id;

    if (data.id)
      return res
        .status(400)
        .json({ success: false, data: null, error: "Cannot update id field" });

    try {
      const card = await cardServices.update(id, data);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
  //cascade delete
  deleteCard: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const deletedCard = await cardServices.delete(id);
      return res
        .status(200)
        .json({ success: true, data: { card: deletedCard } });
    } catch (e) {
      next(e);
    }
  },
  getCardsByRestaurantId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const restaurantId = req.params.restaurantId;

    try {
      const cards = await cardRepository.getByRestaurantId(restaurantId);

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
    const id = req.params.id;

    try {
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
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const cards = await cardRepository.get(offset, limit);

      return res.status(200).json({ success: true, data: { cards: cards } });
    } catch (e) {
      next(e);
    }
  },
};
