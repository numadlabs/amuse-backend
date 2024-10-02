import { Insertable, Updateable } from "kysely";
import { cardRepository } from "../repository/cardRepository";
import { Card } from "../types/db/types";
import { deleteFromS3, uploadToS3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { config } from "../config/config";
import { employeeRepository } from "../repository/employeeRepository";
import { db } from "../utils/db";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { parseChangedFieldsFromObject } from "../lib/parseChangedFieldsFromObject";
import { employeeServices } from "./employeeServices";

const s3BucketName = config.AWS_S3_BUCKET_NAME;

export const cardServices = {
  create: async (
    data: Insertable<Card>,
    file: Express.Multer.File,
    issuerId: string
  ) => {
    const restaurant = await restaurantRepository.getById(
      db,
      data.restaurantId
    );
    if (!restaurant) throw new CustomError("Invalid restaurantId", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      restaurant.id
    );

    const cardCheck = await cardRepository.getByRestaurantId(data.restaurantId);
    if (cardCheck.length > 0)
      throw new CustomError("Card already exists for this restaurant", 400);

    data.benefits =
      "Earn Bitcoin for every visits, Complimentary bites along the way.";
    data.instruction =
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.";
    const card = await cardRepository.create(data);

    if (!file) return card;

    const randomKey = randomUUID();
    await uploadToS3(`restaurant/${randomKey}`, file);

    card.nftImageUrl = randomKey;

    const updatedCard = await cardRepository.update(db, card.id, card);

    await auditTrailRepository.create(db, {
      tableName: "CARD",
      operation: "INSERT",
      data: updatedCard,
      updatedEmployeeId: issuer.id,
    });

    return updatedCard;
  },
  update: async (
    id: string,
    data: Updateable<Card>,
    file: Express.Multer.File,
    issuerId: string
  ) => {
    const card = await cardRepository.getById(id);
    if (!card) throw new CustomError("Invalid cardId", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      card.restaurantId
    );

    const result = await db.transaction().execute(async (trx) => {
      if (file && card.nftImageUrl) {
        await deleteFromS3(`restaurant/${card.nftImageUrl}`);
      }

      if (file) {
        const randomKey = randomUUID();
        await uploadToS3(`restaurant/${randomKey}`, file);

        data.nftImageUrl = randomKey;
      }

      const updatedCard = await cardRepository.update(trx, card.id, data);

      const changedData = parseChangedFieldsFromObject(card, updatedCard);
      await auditTrailRepository.create(trx, {
        tableName: "CARD",
        operation: "UPDATE",
        data: changedData,
        updatedEmployeeId: issuer.id,
      });
    });

    return result;
  },
  delete: async (id: string) => {
    const card = await cardRepository.getById(id);

    if (card.nftImageUrl) await deleteFromS3(`restaurant/${card.nftImageUrl}`);

    const deletedCard = await cardRepository.delete(card.id);

    return deletedCard;
  },
};
