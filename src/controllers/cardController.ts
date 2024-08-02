import { NextFunction, Request, Response } from "express";
import { Insertable, Updateable } from "kysely";
import { Card } from "../types/db/types";
import { cardRepository } from "../repository/cardRepository";
import { cardServices } from "../services/cardServices";
import { AuthenticatedRequest } from "../../custom";
import { CustomError } from "../exceptions/CustomError";

export const cardController = {
  createCard: async (req: Request, res: Response, next: NextFunction) => {
    const data: Insertable<Card> = { ...req.body };
    const file = req.file as Express.Multer.File;

    if (
      data.id ||
      data.nftImageUrl ||
      data.restaurantId ||
      data.nftImageUrl === "" ||
      data.restaurantId === ""
    )
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad inputs." });

    try {
      if (!file) throw new CustomError("Please provide the image.", 400);

      const card = await cardServices.create(data, file);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
  updateCard: async (req: Request, res: Response, next: NextFunction) => {
    const data: Updateable<Card> = { ...req.body };
    const file = req.file as Express.Multer.File;
    const id = req.params.id;

    if (
      data.id ||
      data.nftImageUrl ||
      data.restaurantId ||
      data.nftImageUrl === "" ||
      data.restaurantId === ""
    )
      return res
        .status(400)
        .json({ success: false, data: null, error: "Bad inputs." });

    try {
      const card = await cardServices.update(id, data, file);

      return res.status(200).json({ success: true, data: { card: card } });
    } catch (e) {
      next(e);
    }
  },
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const restaurantId = req.params.restaurantId;

    if (!req.user?.id)
      return res.status(400).json({
        success: false,
        data: null,
        error: "Could not retrieve id from the token.",
      });

    try {
      const cards = await cardRepository.getByRestaurantId(
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
