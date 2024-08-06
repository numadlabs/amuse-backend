import { Insertable } from "kysely";
import { cardRepository } from "../repository/cardRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { CustomError } from "../exceptions/CustomError";
import { UserCard } from "../types/db/types";

export const userCardServices = {
  buy: async (data: Insertable<UserCard>) => {
    const isValidCard = await cardRepository.getById(data.cardId);
    if (!isValidCard) throw new CustomError("Invalid restaurant id.", 400);

    const userCard = await userCardReposity.checkExists(
      data.userId,
      data.cardId
    );
    if (userCard) throw new CustomError("You already have this card.", 400);

    const createdUserCard = await userCardReposity.create(data);
    return createdUserCard;
  },
  delete: async (id: string) => {
    const userCard = await userCardReposity.getById(id);

    const deletedUserCard = await userCardReposity.delete(userCard.id);
    return deletedUserCard;
  },
};
