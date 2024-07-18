import { Insertable, Updateable } from "kysely";
import { cardRepository } from "../repository/cardRepository";
import { Card } from "../types/db/types";
import { s3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { s3BucketName } from "../lib/constants";

export const cardServices = {
  create: async (data: Insertable<Card>, file: Express.Multer.File) => {
    const card = await cardRepository.create(data);

    if (!file) return card;

    const randomKey = randomUUID();
    const s3Response = await s3
      .upload({
        Bucket: s3BucketName,
        Key: `restaurant/${randomKey}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    card.nftImageUrl = randomKey;

    const updatedCard = await cardRepository.update(card.id, card);

    return updatedCard;
  },
  update: async (
    id: string,
    data: Updateable<Card>,
    file: Express.Multer.File
  ) => {
    const card = await cardRepository.getById(id);

    if (file && card.nftImageUrl) {
      await s3
        .deleteObject({
          Bucket: s3BucketName,
          Key: `restaurant/${card.nftImageUrl}`,
        })
        .promise();
    }

    if (file) {
      const randomKey = randomUUID();
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: `restaurant/${randomKey}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      card.nftImageUrl = randomKey;
    }

    const updatedCard = await cardRepository.update(card.id, data);

    return updatedCard;
  },
  delete: async (id: string) => {
    const card = await cardRepository.getById(id);

    const deletedCard = await cardRepository.delete(card.id);

    return deletedCard;
  },
};
